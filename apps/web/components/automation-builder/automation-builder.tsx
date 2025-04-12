"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@church-space/ui/cn";
import { Button } from "@church-space/ui/button";
import { Card, CardContent } from "@church-space/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { Input } from "@church-space/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { SheetTitle, SheetHeader, SheetFooter } from "@church-space/ui/sheet";
import ListSelector from "../id-pages/emails/list-selector";
import EmailTemplateSelector from "./email-template-selector";
import DomainSelector from "../id-pages/emails/domain-selector";
import { useToast } from "@church-space/ui/use-toast";
import { updateEmailAutomationAction } from "@/actions/update-email-automation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type TriggerType = "person_added" | "person_removed";
type ActionType = "wait" | "send_email";

interface WaitStepValues {
  unit: "days" | "hours";
  value: number;
}

interface EmailStepValues {
  fromName: string;
  fromEmail: string;
  subject: string;
}

interface AutomationStep {
  id?: number;
  type: ActionType;
  values: WaitStepValues | EmailStepValues;
  order: number | null;
  from_email_domain?: number | null;
  email_template?: number | null;
  updated_at?: string | null;
  created_at?: string;
}

export interface EmailAutomation {
  id: number;
  name: string;
  trigger_type: TriggerType | null;
  list_id: number | null;
  is_active: boolean;
  updated_at: string | null;
  created_at: string;
  description: string | null;
  organization_id: string;
  steps: AutomationStep[];
}

// Type guard functions to check step types
function isWaitStep(
  step: AutomationStep,
): step is AutomationStep & { values: WaitStepValues } {
  return step.type === "wait";
}

function isEmailStep(
  step: AutomationStep,
): step is AutomationStep & { values: EmailStepValues } {
  return step.type === "send_email";
}

// Helper function to get initial step values
function getInitialStepValues(
  step: AutomationStep,
): WaitStepValues | EmailStepValues {
  if (step.type === "wait") {
    const waitValues = step.values as Partial<WaitStepValues>;
    return {
      unit: waitValues.unit || "days",
      value: waitValues.value || 1,
    } as WaitStepValues;
  } else {
    const emailValues = step.values as Partial<EmailStepValues>;
    return {
      fromName: emailValues.fromName || "",
      fromEmail: emailValues.fromEmail || "",
      subject: emailValues.subject || "",
    } as EmailStepValues;
  }
}

export default function EmailAutomationBuilder({
  organizationId,
  onChangesPending,
  automation,
  closeSheet,
}: {
  organizationId: string;
  onChangesPending: (hasPendingChanges: boolean) => void;
  automation: EmailAutomation;
  closeSheet: () => void;
}) {
  const [trigger, setTrigger] = useState<TriggerType | null>(
    automation?.trigger_type || null,
  );
  const [selectedList, setSelectedList] = useState<string>(
    automation?.list_id?.toString() || "",
  );
  const [steps, setSteps] = useState<AutomationStep[]>(
    automation?.steps?.map((step) => ({
      ...step,
      values: getInitialStepValues(step),
    })) || [],
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: updateAutomation, isPending: isSaving } = useMutation({
    mutationFn: updateEmailAutomationAction,
    onSuccess: (result) => {
      // Handle the nested response format
      const responseData = Array.isArray(result) ? result[1] : result;
      if (responseData?.data?.success === false) {
        toast({
          title: "Error",
          description: responseData.data.error || "Failed to update automation",
          variant: "destructive",
        });
        return;
      }

      // Update initial state to current state after saving
      initialState.current = {
        trigger,
        selectedList,
        steps,
      };

      setHasUnsavedChanges(false);
      onChangesPending(false);
      closeSheet();

      toast({
        title: "Success",
        description: "Automation updated successfully",
      });

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["email-automation", automation.id],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update automation",
        variant: "destructive",
      });
    },
  });

  // Store initial state for comparison
  const initialState = useRef({
    trigger: automation?.trigger_type || null,
    selectedList: automation?.list_id?.toString() || "",
    steps: automation?.steps || [],
  });

  const [waitTimeError, setWaitTimeError] = useState<string | null>(null);

  // Function to validate wait time and update error state
  const validateWaitTime = useCallback(
    (value: number, unit: "days" | "hours") => {
      if ((unit === "hours" && value > 24) || (unit === "days" && value > 31)) {
        setWaitTimeError(
          `Maximum wait time is ${unit === "hours" ? "24 hours" : "31 days"}`,
        );
        return false;
      }
      setWaitTimeError(null);
      return true;
    },
    [],
  );

  // Function to add a new step
  const addStep = (type: ActionType) => {
    setSteps((prev) => {
      const newOrder =
        prev.length > 0 ? Math.max(...prev.map((s) => s.order || 0)) + 1 : 0;
      const newStep: AutomationStep = {
        type,
        order: newOrder,
        values:
          type === "wait"
            ? { unit: "days", value: 1 }
            : { fromName: "", fromEmail: "", subject: "" },
      };
      return [...prev, newStep];
    });
  };

  // Function to update a step
  const updateStep = (index: number, updates: Partial<AutomationStep>) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], ...updates };
      return newSteps;
    });
  };

  // Function to remove a step
  const removeStep = (index: number) => {
    setSteps((prev) => {
      const newSteps = prev.filter((_, i) => i !== index);
      // Reorder remaining steps
      return newSteps.map((step, i) => ({ ...step, order: i }));
    });
  };

  // Function to move a step up or down
  const moveStep = (index: number, direction: "up" | "down") => {
    setSteps((prev) => {
      const newSteps = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newSteps.length) return prev;

      // Swap steps
      [newSteps[index], newSteps[newIndex]] = [
        newSteps[newIndex],
        newSteps[index],
      ];
      // Update orders
      return newSteps.map((step, i) => ({ ...step, order: i }));
    });
  };

  // Function to check if current state differs from initial state
  const checkForChanges = useCallback(() => {
    const hasChanges =
      trigger !== initialState.current.trigger ||
      selectedList !== initialState.current.selectedList ||
      JSON.stringify(steps) !== JSON.stringify(initialState.current.steps);

    setHasUnsavedChanges(hasChanges);
    onChangesPending(hasChanges);
  }, [trigger, selectedList, steps, onChangesPending]);

  // Track changes whenever state updates
  useEffect(() => {
    checkForChanges();
  }, [trigger, selectedList, steps, checkForChanges]);

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    // Validate all wait steps
    const waitSteps = steps.filter(isWaitStep);
    for (const step of waitSteps) {
      if (!validateWaitTime(step.values.value, step.values.unit)) {
        return;
      }
    }

    const automationData = {
      automation_id: automation.id,
      automation_data: {
        id: automation.id,
        trigger_type: trigger,
        list_id: selectedList ? parseInt(selectedList) : null,
        steps: steps.map((step) => {
          const baseStep = {
            id: step.id || undefined,
            order: step.order,
            type: step.type,
            from_email_domain: step.from_email_domain || null,
            email_template: step.email_template || null,
          };

          if (isWaitStep(step)) {
            return {
              ...baseStep,
              values: {
                unit: step.values.unit,
                value: step.values.value,
              } as WaitStepValues,
            };
          } else if (isEmailStep(step)) {
            return {
              ...baseStep,
              values: {
                fromName: step.values.fromName,
                fromEmail: step.values.fromEmail,
                subject: step.values.subject,
              } as EmailStepValues,
            };
          } else {
            throw new Error(`Invalid step type: ${step.type}`);
          }
        }),
      },
    };

    updateAutomation(automationData);
  };

  // Update cancel button to reset to initial state
  const handleCancel = () => {
    setTrigger(initialState.current.trigger);
    setSelectedList(initialState.current.selectedList);
    setSteps(initialState.current.steps);
    setHasUnsavedChanges(false);
    onChangesPending(false);
  };

  return (
    <div className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle>Automation Steps</SheetTitle>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto sm:p-4">
        {/* Trigger Section */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Trigger
          </div>

          <Card className="relative">
            <CardContent className="p-4">
              <Select
                value={trigger || ""}
                onValueChange={(value: TriggerType) => setTrigger(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person_added">
                    When a person is added to a list
                  </SelectItem>
                  <SelectItem value="person_removed">
                    When a person is removed from a list
                  </SelectItem>
                </SelectContent>
              </Select>

              <AnimatePresence>
                {(trigger === "person_added" ||
                  trigger === "person_removed") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3">
                      <ListSelector
                        value={selectedList}
                        onChange={setSelectedList}
                        organizationId={organizationId}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            {trigger && (
              <div className="absolute -bottom-4 left-1/2 z-10 -ml-0.5 h-4 w-0.5 bg-border"></div>
            )}
          </Card>
        </div>

        {/* Actions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              Actions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep("wait")}
              >
                Add Wait
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep("send_email")}
              >
                Add Email
              </Button>
            </div>
          </div>

          {/* Steps */}
          {steps.map((step, index) => (
            <Card
              key={step.id || index}
              className="relative border-dashed border-border"
            >
              <CardContent className="p-0">
                {step.type === "wait" && isWaitStep(step) && (
                  <div className="space-y-4">
                    <div className="flex h-14 w-full items-center justify-between px-4">
                      <div className="flex w-full items-center gap-2">
                        <span className="flex-1 font-medium text-foreground">
                          Wait
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(index, "down")}
                          disabled={index === steps.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            className={cn(
                              "w-20",
                              waitTimeError && "border-destructive",
                            )}
                            value={step.values.value}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value);
                              updateStep(index, {
                                values: {
                                  ...step.values,
                                  value,
                                },
                              });
                            }}
                          />
                          <Select
                            value={step.values.unit}
                            onValueChange={(value: "days" | "hours") => {
                              updateStep(index, {
                                values: {
                                  ...step.values,
                                  unit: value,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {waitTimeError && (
                          <p className="text-sm text-destructive">
                            {waitTimeError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step.type === "send_email" && isEmailStep(step) && (
                  <div className="space-y-4">
                    <div className="flex h-14 w-full items-center justify-between px-4">
                      <span className="flex-1 font-medium text-foreground">
                        Send Email
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(index, "down")}
                          disabled={index === steps.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 px-4 pb-4">
                      <div>
                        <div className="mb-1 text-xs">Email Template</div>
                        <EmailTemplateSelector
                          value={step.email_template?.toString() || ""}
                          onChange={(value) => {
                            updateStep(index, {
                              email_template: value ? parseInt(value) : null,
                            });
                          }}
                          organizationId={organizationId}
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs">From Name</div>
                        <Input
                          placeholder="Your Name"
                          value={step.values.fromName}
                          onChange={(e) => {
                            updateStep(index, {
                              values: {
                                ...step.values,
                                fromName: e.target.value,
                              },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs">From Email</div>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Enter from"
                            value={step.values.fromEmail}
                            onChange={(e) => {
                              updateStep(index, {
                                values: {
                                  ...step.values,
                                  fromEmail: e.target.value,
                                },
                              });
                            }}
                          />
                          <span className="mb-1 leading-none">@</span>
                          <DomainSelector
                            organizationId={organizationId}
                            onChange={(value) => {
                              updateStep(index, {
                                from_email_domain: value
                                  ? parseInt(value)
                                  : null,
                              });
                            }}
                            value={step.from_email_domain?.toString() || ""}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs">Subject</div>
                        <Input
                          placeholder="Email Subject"
                          value={step.values.subject}
                          onChange={(e) => {
                            updateStep(index, {
                              values: {
                                ...step.values,
                                subject: e.target.value,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {index < steps.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 z-10 -ml-0.5 h-4 w-0.5 bg-border"></div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 mt-auto border-t bg-background">
        <SheetFooter className="flex flex-row justify-end gap-2 p-4 pb-0 sm:items-center">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </div>
    </div>
  );
}

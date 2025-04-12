"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@church-space/ui/accordion";
import ListSelector from "../id-pages/emails/list-selector";
import EmailTemplateSelector from "./email-template-selector";
import DomainSelector from "../id-pages/emails/domain-selector";
import { useToast } from "@church-space/ui/use-toast";
import { updateEmailAutomationAction } from "@/actions/update-email-automation";
import { updateEmailAutomationStepAction } from "@/actions/update-email-automation-step";
import { deleteEmailAutomationStepAction } from "@/actions/delete-email-automation-step";
import { createEmailAutomationStepAction } from "@/actions/create-email-automation-step";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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

// Override accordion trigger styles for this component
const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger>
>((props, ref) => (
  <AccordionTrigger
    ref={ref}
    className={cn(
      "flex w-full flex-1 items-center justify-between px-3 py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
      props.className,
    )}
  >
    <span className="truncate pr-2 text-sm">{props.children}</span>
  </AccordionTrigger>
));
CustomAccordionTrigger.displayName = "CustomAccordionTrigger";

type SortableStepProps = {
  step: AutomationStep;
  index: number;
  steps: AutomationStep[];
  updateStep: (index: number, updates: Partial<AutomationStep>) => void;
  removeStep: (index: number) => void;
  validateWaitTime: (value: number, unit: "days" | "hours") => boolean;
  waitTimeError: string | null;
  organizationId: string;
  openItem: string | undefined;
  setOpenItem: (value: string | undefined) => void;
};

function SortableStep(props: SortableStepProps) {
  const {
    step,
    index,
    steps,
    updateStep: updateStepInState,
    removeStep,
    validateWaitTime,
    waitTimeError,
    organizationId,
    openItem,
    setOpenItem,
  } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        zIndex: isDragging ? 10 : 1,
      }
    : undefined;

  // Generate a stable ID for the accordion item
  const stepId = `step-${step.order}-${index}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 w-full rounded-md border",
        isDragging ? "border-dashed bg-accent opacity-50" : "",
      )}
    >
      <div className="flex w-full items-center p-0.5 pr-1">
        <div
          className="flex cursor-grab touch-none items-center justify-center px-3 py-4"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openItem === stepId ? stepId : undefined}
          onValueChange={(value) => setOpenItem(value)}
        >
          <AccordionItem value={stepId} className="border-0">
            <CustomAccordionTrigger>
              {step.type === "wait" ? "Wait" : "Send Email"}
            </CustomAccordionTrigger>
            <AccordionContent>
              {step.type === "wait" && isWaitStep(step) && (
                <div className="grid grid-cols-4 items-center gap-x-2 gap-y-2 py-1 pr-2">
                  <div className="col-span-4 flex flex-col gap-2">
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
                            e.target.value === "" ? 0 : Number(e.target.value);
                          updateStepInState(index, {
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
                          updateStepInState(index, {
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
                  <Button
                    variant="outline"
                    onClick={() => removeStep(index)}
                    className="col-span-4 mt-3 h-7 w-full hover:bg-destructive hover:text-white"
                  >
                    Remove Step
                  </Button>
                </div>
              )}

              {step.type === "send_email" && isEmailStep(step) && (
                <div className="grid grid-cols-4 items-center gap-x-2 gap-y-2 py-1 pr-2">
                  <div className="col-span-4">
                    <div className="mb-1 text-xs">Email Template</div>
                    <EmailTemplateSelector
                      value={step.email_template?.toString() || ""}
                      onChange={(value) => {
                        updateStepInState(index, {
                          email_template: value ? parseInt(value) : null,
                        });
                      }}
                      organizationId={organizationId}
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="mb-1 text-xs">From Name</div>
                    <Input
                      placeholder="Your Name"
                      value={step.values.fromName}
                      onChange={(e) => {
                        updateStepInState(index, {
                          values: {
                            ...step.values,
                            fromName: e.target.value,
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="mb-1 text-xs">From Email</div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter from"
                        value={step.values.fromEmail}
                        onChange={(e) => {
                          updateStepInState(index, {
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
                          updateStepInState(index, {
                            from_email_domain: value ? parseInt(value) : null,
                          });
                        }}
                        value={step.from_email_domain?.toString() || ""}
                      />
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="mb-1 text-xs">Subject</div>
                    <Input
                      placeholder="Email Subject"
                      value={step.values.subject}
                      onChange={(e) => {
                        updateStepInState(index, {
                          values: {
                            ...step.values,
                            subject: e.target.value,
                          },
                        });
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => removeStep(index)}
                    className="col-span-4 mt-3 h-7 w-full hover:bg-destructive hover:text-white"
                  >
                    Remove Step
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {index < steps.length - 1 && (
        <div className="absolute -bottom-4 left-1/2 z-10 -ml-0.5 h-4 w-0.5 bg-border"></div>
      )}
    </div>
  );
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
  const [openStep, setOpenStep] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create mutations for each step action
  const { mutateAsync: updateStepMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: updateEmailAutomationStepAction,
      onError: (error) => {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to update step",
          variant: "destructive",
        });
      },
    });

  const { mutateAsync: createStep, isPending: isCreating } = useMutation({
    mutationFn: createEmailAutomationStepAction,
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create step",
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: deleteStep, isPending: isDeleting } = useMutation({
    mutationFn: deleteEmailAutomationStepAction,
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete step",
        variant: "destructive",
      });
    },
  });

  const isSaving = isUpdating || isCreating || isDeleting;

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
      const newSteps = [...prev, newStep];

      // Set the new step to be open
      setOpenStep(`step-${newOrder}-${prev.length}`);

      return newSteps;
    });
  };

  // Function to update a step
  const updateStepInState = (
    index: number,
    updates: Partial<AutomationStep>,
  ) => {
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
    // Helper function to normalize step for comparison
    const normalizeStep = (step: AutomationStep) => ({
      id: step.id,
      type: step.type,
      order: step.order,
      from_email_domain: step.from_email_domain || null,
      email_template: step.email_template || null,
      values: isWaitStep(step)
        ? {
            unit: step.values.unit,
            value: step.values.value,
          }
        : isEmailStep(step)
          ? {
              fromName: step.values.fromName,
              fromEmail: step.values.fromEmail,
              subject: step.values.subject,
            }
          : step.values,
    });

    // Normalize and stringify both arrays for comparison
    const normalizedCurrentSteps = steps.map(normalizeStep);
    const normalizedInitialSteps =
      initialState.current.steps.map(normalizeStep);

    const hasChanges =
      trigger !== initialState.current.trigger ||
      selectedList !== initialState.current.selectedList ||
      JSON.stringify(normalizedCurrentSteps) !==
        JSON.stringify(normalizedInitialSteps);

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

  // Add DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Add handleDragEnd function
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over.id.toString());

      setSteps((prev) => {
        const reorderedSteps = [...prev];
        const [movedItem] = reorderedSteps.splice(oldIndex, 1);
        reorderedSteps.splice(newIndex, 0, movedItem);

        return reorderedSteps.map((step, index) => ({
          ...step,
          order: index,
        }));
      });
    }
  };

  const handleSave = async () => {
    // Validate all wait steps
    const waitSteps = steps.filter(isWaitStep);
    for (const step of waitSteps) {
      if (!validateWaitTime(step.values.value, step.values.unit)) {
        return;
      }
    }

    try {
      // Find deleted steps by comparing with initial state
      const deletedSteps = initialState.current.steps.filter(
        (initialStep) =>
          initialStep.id && !steps.find((s) => s.id === initialStep.id),
      );

      // Delete removed steps
      await Promise.all(
        deletedSteps.map((step) =>
          deleteStep({
            stepId: step.id!,
          }),
        ),
      );

      // Update or create steps
      const updatedSteps = await Promise.all(
        steps.map(async (step) => {
          const baseStepData = {
            type: step.type,
            order: step.order,
            from_email_domain: step.from_email_domain || null,
            email_template: step.email_template || null,
            automation_id: automation.id,
            values: isWaitStep(step)
              ? {
                  unit: step.values.unit,
                  value: step.values.value,
                }
              : isEmailStep(step)
                ? {
                    fromName: step.values.fromName,
                    fromEmail: step.values.fromEmail,
                    subject: step.values.subject,
                  }
                : null,
          };

          if (step.id) {
            // Update existing step
            const result = await updateStepMutation({
              id: step.id,
              automation_data: {
                type: baseStepData.type,
                order: baseStepData.order,
                from_email_domain: baseStepData.from_email_domain,
                email_template: baseStepData.email_template,
                automation_id: baseStepData.automation_id,
                values: baseStepData.values,
              },
            });
            return result?.data ? { ...step, ...result.data } : step;
          } else {
            // Create new step
            const result = await createStep(baseStepData);
            return result?.data ? { ...step, ...result.data } : step;
          }
        }),
      );

      // Update initial state to current state after saving, with server-assigned IDs
      initialState.current = {
        trigger,
        selectedList,
        steps: updatedSteps,
      };

      // Update the current steps state with server-assigned IDs
      setSteps(updatedSteps);

      setHasUnsavedChanges(false);
      onChangesPending(false);
      closeSheet();

      toast({
        title: "Success",
        description: "Automation steps updated successfully",
      });

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["email-automation", automation.id],
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update automation steps",
        variant: "destructive",
      });
    }
  };

  // Update cancel button to reset to initial state
  const handleCancel = () => {
    setTrigger(initialState.current.trigger);
    setSelectedList(initialState.current.selectedList);
    setSteps(initialState.current.steps);
    setHasUnsavedChanges(false);
    onChangesPending(false);
    closeSheet();
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

          {/* Steps with DnD */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[
              (args) => ({
                ...args.transform,
                scaleX: 1,
                scaleY: 1,
              }),
            ]}
          >
            <SortableContext
              items={steps.map((_, i) => i.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <SortableStep
                    key={step.id || index}
                    step={step}
                    index={index}
                    steps={steps}
                    updateStep={updateStepInState}
                    removeStep={removeStep}
                    validateWaitTime={validateWaitTime}
                    waitTimeError={waitTimeError}
                    organizationId={organizationId}
                    openItem={openStep}
                    setOpenItem={setOpenStep}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

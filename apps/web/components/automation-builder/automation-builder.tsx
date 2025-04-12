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

import { Switch } from "@church-space/ui/switch";
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

export interface EmailAutomation {
  id: number;
  name: string;
  trigger_type: TriggerType | null;
  wait: {
    enabled: boolean;
    unit: "days" | "hours";
    value: number;
  } | null;
  email_details: {
    enabled: boolean;
    fromName: string;
    fromEmail: string;
    subject: string;
  } | null;
  email_template_id: number | null;
  list_id: number | null;
  from_email_domain: number | null;
  is_active: boolean;
  updated_at: string | null;
  created_at: string;
  description: string | null;
  organization_id: string;
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
        actions,
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
    trigger: automation?.trigger_type || (null as TriggerType | null),
    selectedList: automation?.list_id?.toString() || "",
    actions: {
      wait: {
        enabled: automation?.wait?.enabled ?? false,
        unit: automation?.wait?.unit || "days",
        value: automation?.wait?.value || 1,
      },
      send_email: {
        enabled: true,
        template: automation?.email_template_id?.toString() || "",
        fromName: automation?.email_details?.fromName || "",
        fromEmail: automation?.email_details?.fromEmail || "",
        subject: automation?.email_details?.subject || "",
        fromDomain: automation?.from_email_domain?.toString() || "",
      },
    },
  });

  const [actions, setActions] = useState(initialState.current.actions);
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

  // Update validation whenever wait time changes
  useEffect(() => {
    if (actions.wait.enabled && actions.wait.value) {
      validateWaitTime(actions.wait.value, actions.wait.unit);
    } else {
      setWaitTimeError(null);
    }
  }, [
    actions.wait.value,
    actions.wait.unit,
    actions.wait.enabled,
    validateWaitTime,
  ]);

  // Function to check if current state differs from initial state
  const checkForChanges = useCallback(() => {
    const hasChanges =
      trigger !== initialState.current.trigger ||
      selectedList !== initialState.current.selectedList ||
      JSON.stringify({
        ...actions,
        send_email: { ...actions.send_email, enabled: true },
      }) !==
        JSON.stringify({
          ...initialState.current.actions,
          send_email: {
            ...initialState.current.actions.send_email,
            enabled: true,
          },
        });

    setHasUnsavedChanges(hasChanges);
    onChangesPending(hasChanges);
  }, [trigger, selectedList, actions, onChangesPending]);

  // Track changes whenever state updates
  useEffect(() => {
    checkForChanges();
  }, [trigger, selectedList, actions, checkForChanges]);

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
    // Validate wait time before saving
    if (actions.wait.enabled) {
      if (!validateWaitTime(actions.wait.value, actions.wait.unit)) {
        return;
      }
    }

    const automationData = {
      automation_id: automation.id,
      automation_data: {
        id: automation.id,
        trigger_type: trigger,
        list_id: selectedList ? parseInt(selectedList) : null,
        wait: {
          enabled: actions.wait.enabled,
          unit: actions.wait.unit,
          value: actions.wait.value,
        },
        email_details: {
          enabled: true,
          fromName: actions.send_email.fromName,
          fromEmail: actions.send_email.fromEmail,
          subject: actions.send_email.subject,
        },
        email_template_id: actions.send_email.template
          ? parseInt(actions.send_email.template)
          : null,
        from_email_domain: actions.send_email.fromDomain
          ? parseInt(actions.send_email.fromDomain)
          : null,
      },
    };

    updateAutomation(automationData);
  };

  // Update cancel button to reset to initial state
  const handleCancel = () => {
    // Reset to initial state
    setTrigger(initialState.current.trigger);
    setSelectedList(initialState.current.selectedList);
    setActions(initialState.current.actions);
    setHasUnsavedChanges(false);
    onChangesPending(false);
  };

  const toggleAction = (action: ActionType) => {
    setActions((prev) => ({
      ...prev,
      [action]: {
        ...prev[action],
        enabled: !prev[action].enabled,
      },
    }));
  };

  const updateActionField = (
    action: ActionType,
    field: string,
    value: string | number,
  ) => {
    setActions((prev) => ({
      ...prev,
      [action]: {
        ...prev[action],
        [field]: value,
      },
    }));
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
          <div className="text-sm font-medium text-muted-foreground">
            Actions
          </div>

          {/* Wait Action */}
          <Card
            className={cn(
              "relative border-dashed",
              actions.wait.enabled ? "border-primary" : "border-border",
            )}
          >
            <CardContent className="p-0">
              <div className="flex h-14 w-full items-center px-4">
                <div className="flex w-full items-center gap-2">
                  <Switch
                    checked={actions.wait.enabled}
                    onCheckedChange={() => toggleAction("wait")}
                  />
                  <span
                    className={cn(
                      "flex-1 cursor-pointer font-medium",
                      actions.wait.enabled
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                    onClick={() => {
                      toggleAction("wait");
                    }}
                  >
                    Wait
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {actions.wait.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            className={cn(
                              "w-20",
                              waitTimeError && "border-destructive",
                            )}
                            value={
                              actions.wait.value === null
                                ? ""
                                : actions.wait.value
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value);
                              updateActionField("wait", "value", value);
                            }}
                          />
                          <Select
                            value={actions.wait.unit}
                            onValueChange={(value: "days" | "hours") => {
                              updateActionField("wait", "unit", value);
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
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <div className="absolute -bottom-4 left-1/2 z-10 -ml-0.5 h-4 w-0.5 bg-border"></div>
          </Card>

          {/* Send Email Action */}
          <Card className={cn("relative border-dashed border-primary")}>
            <CardContent className="p-0">
              <div className="flex h-14 w-full items-center px-4">
                <div className="flex w-full items-center gap-2">
                  <span className="flex-1 font-medium text-foreground">
                    Send Email
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-4 pb-4">
                <div>
                  <div className="mb-1 text-xs">Email Template</div>
                  <EmailTemplateSelector
                    value={actions.send_email.template}
                    onChange={(value) =>
                      updateActionField("send_email", "template", value)
                    }
                    organizationId={organizationId}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs">From Name</div>
                  <Input
                    placeholder="Your Name"
                    value={actions.send_email.fromName}
                    onChange={(e) =>
                      updateActionField(
                        "send_email",
                        "fromName",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs">From Email</div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter from"
                      value={actions.send_email.fromEmail}
                      onChange={(e) =>
                        updateActionField(
                          "send_email",
                          "fromEmail",
                          e.target.value,
                        )
                      }
                    />
                    <span className="mb-1 leading-none">@</span>
                    <DomainSelector
                      organizationId={organizationId}
                      onChange={(value) =>
                        updateActionField("send_email", "fromDomain", value)
                      }
                      value={actions.send_email.fromDomain}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs">Subject</div>
                  <Input
                    placeholder="Email Subject"
                    value={actions.send_email.subject}
                    onChange={(e) =>
                      updateActionField("send_email", "subject", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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

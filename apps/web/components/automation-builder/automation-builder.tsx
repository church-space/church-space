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
import { GripVertical, Plus } from "lucide-react";
import { updateEmailAutomationAction } from "@/actions/update-email-automation";
import CategorySelector from "../id-pages/emails/category-selector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@church-space/ui/alert-dialog";
import { HourglassClock } from "@church-space/ui/icons";
import { Email } from "@church-space/ui/icons";

export type TriggerType = "person_added" | "person_removed";
type ActionType = "wait" | "send_email";

interface WaitStepValues {
  unit: "days" | "hours";
  value: number | "";
}

interface EmailStepValues {
  fromName: string;
  fromEmail: string;
  subject: string;
}

interface AutomationStep {
  id?: number;
  tempId?: string;
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
  email_category_id: number | null;
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
      value: waitValues.value || "",
    } as WaitStepValues;
  } else {
    const emailValues = step.values as Partial<EmailStepValues>;
    const rawFromEmail = emailValues.fromEmail || "";
    const sanitizedFromEmail = rawFromEmail.replace(/\s+/g, "").toLowerCase();
    return {
      fromName: emailValues.fromName || "",
      fromEmail: sanitizedFromEmail,
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
  waitTimeError: string | null;
  setWaitTimeError: (error: string | null) => void;
  emailStepError: string | null;
  errorStepIds: string[];
  organizationId: string;
  openItem: string;
  setOpenItem: (value: string) => void;
  fieldErrors: Record<string, string[]>;
  clearFieldError: (stepId: string, fieldName: string) => void;
};

function SortableStep(props: SortableStepProps) {
  const {
    step,
    index,
    steps,
    updateStep: updateStepInState,
    removeStep,
    waitTimeError,
    setWaitTimeError,
    emailStepError,
    errorStepIds,
    organizationId,
    openItem,
    setOpenItem,
    fieldErrors,
    clearFieldError,
  } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id?.toString() || step.tempId || "" });

  const style = {
    transform: CSS.Transform.toString(
      transform
        ? {
            x: transform.x,
            y: transform.y,
            scaleX: 1,
            scaleY: 1,
          }
        : null,
    ),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  // Generate a stable ID for the accordion item
  const stepId = step.id ? `step-${step.id}` : step.tempId || `temp-${index}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 w-full rounded-md border",
        isDragging ? "border-dashed bg-accent opacity-50" : "",
        step.type === "wait" && "bg-yellow-500/10 dark:bg-yellow-500/20",
        step.type === "send_email" && "bg-green-500/10 dark:bg-green-500/20",
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
          value={openItem === stepId ? stepId : ""}
          onValueChange={(value) => setOpenItem(value || "")}
        >
          <AccordionItem
            value={stepId}
            className={cn(
              "my-0.5 border-0",
              (step.type === "wait" &&
                waitTimeError &&
                errorStepIds.includes(stepId)) ||
                (step.type === "send_email" &&
                  emailStepError !== null &&
                  errorStepIds.includes(stepId))
                ? "rounded-md border border-destructive shadow-none ring-1 ring-destructive"
                : "",
            )}
          >
            <CustomAccordionTrigger>
              <span className="flex items-center gap-2">
                {step.type === "wait" ? (
                  <span className="text-yellow-500">
                    <HourglassClock height={"20"} width={"20"} />
                  </span>
                ) : (
                  <span className="text-green-500">
                    <Email height={"20"} width={"20"} />
                  </span>
                )}
                {step.type === "wait" ? (
                  <span className="flex items-baseline gap-1">
                    <span>Wait</span>
                    {isWaitStep(step) && step.values.value && (
                      <span className="text-xs text-muted-foreground">
                        ({step.values.value}{" "}
                        {step.values.unit === "days"
                          ? step.values.value === 1
                            ? "day"
                            : "days"
                          : step.values.value === 1
                            ? "hour"
                            : "hours"}
                        )
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex min-w-0 items-center gap-1">
                    <span className="flex-shrink-0">Send Email</span>
                    {isEmailStep(step) && step.values.subject && (
                      <span className="max-w-[120px] truncate text-xs text-muted-foreground sm:max-w-[300px] md:max-w-[400px]">
                        ({step.values.subject})
                      </span>
                    )}
                  </span>
                )}
              </span>
            </CustomAccordionTrigger>
            <AccordionContent>
              {step.type === "wait" && isWaitStep(step) && (
                <div className="grid grid-cols-4 items-center gap-x-2 gap-y-2 py-1 pr-2">
                  <div className="col-span-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        className={cn(
                          "w-20 bg-background",
                          waitTimeError && "border-destructive",
                        )}
                        value={step.values.value}
                        onChange={(e) => {
                          const newValue =
                            e.target.value === ""
                              ? ""
                              : Math.max(0, Number(e.target.value));
                          updateStepInState(index, {
                            values: {
                              ...step.values,
                              value: newValue,
                            },
                          });
                          // Clear error if we now have a valid value
                          if (typeof newValue === "number" && newValue > 0) {
                            setWaitTimeError(null);
                          }
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
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">
                            {step.values.value === 1 ? "Day" : "Days"}
                          </SelectItem>
                          <SelectItem value="hours">
                            {step.values.value === 1 ? "Hour" : "Hours"}
                          </SelectItem>
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
                        // Clear error when user selects a template
                        if (value) {
                          clearFieldError(stepId, "template");
                        }
                      }}
                      organizationId={organizationId}
                      className={cn(
                        emailStepError !== null &&
                          errorStepIds.includes(stepId) &&
                          fieldErrors[stepId]?.includes("template") &&
                          "border-destructive ring-1 ring-destructive",
                      )}
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="mb-1 text-xs">Subject</div>
                    <div className="relative w-full">
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
                          // Clear error when user types
                          if (e.target.value.trim()) {
                            clearFieldError(stepId, "subject");
                          }
                        }}
                        maxLength={60}
                        className={cn(
                          "bg-background pe-16",
                          emailStepError !== null &&
                            errorStepIds.includes(stepId) &&
                            fieldErrors[stepId]?.includes("subject") &&
                            "border-destructive ring-1 ring-destructive",
                        )}
                      />

                      <span className="absolute bottom-0 right-0 top-0 flex items-center px-2 text-sm text-muted-foreground">
                        {step.values.subject.length} / 60
                      </span>
                    </div>

                    {/* Subject validation functions */}
                    {step.values.subject &&
                      (() => {
                        // Subject validation functions
                        const wordCount = step.values.subject
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean).length;
                        const charCount = step.values.subject.length;
                        const emojiCount = (
                          step.values.subject.match(/[\p{Emoji}]/gu) || []
                        ).length;
                        const punctuationCount = (
                          step.values.subject.match(/[!?.,;:]/g) || []
                        ).length;

                        // Subject validation warnings
                        const tooManyWords = wordCount > 9;
                        const tooManyChars = charCount > 60;
                        const tooManyEmojis = emojiCount > 2;
                        const tooManyPunctuations = punctuationCount > 2;

                        // Check if any warnings exist
                        const hasWarnings =
                          tooManyWords ||
                          tooManyChars ||
                          tooManyEmojis ||
                          tooManyPunctuations;

                        return (
                          <div
                            className={cn(
                              "my-3 flex flex-col gap-1 rounded-md border px-4 py-2.5",
                              hasWarnings
                                ? "border-amber-500 bg-amber-500/10"
                                : "border-green-500 bg-green-500/10",
                            )}
                          >
                            {tooManyWords && (
                              <span className="text-amber-600">
                                Warning: Subject has {wordCount} words. Consider
                                using 9 or fewer words.
                              </span>
                            )}
                            {tooManyChars && (
                              <span className="text-amber-600">
                                Warning: Subject has {charCount} characters.
                                Consider keeping it under 60 characters.
                              </span>
                            )}
                            {tooManyEmojis && (
                              <span className="text-amber-600">
                                Warning: Subject has {emojiCount} emojis.
                                Consider using 2 or fewer emojis.
                              </span>
                            )}
                            {tooManyPunctuations && (
                              <span className="text-amber-600">
                                Warning: Subject has {punctuationCount}{" "}
                                punctuation marks. Consider using 2 or fewer.
                              </span>
                            )}
                            {!hasWarnings && (
                              <span className="text-green-600">
                                Good! Your subject meets all recommended
                                guidelines.
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {wordCount} words | {charCount}/60 characters |{" "}
                              {emojiCount} emojis | {punctuationCount}{" "}
                              punctuation marks
                            </span>
                          </div>
                        );
                      })()}
                  </div>
                  <div className="col-span-4">
                    <div className="mb-1 text-xs">From Email</div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-full">
                        <Input
                          placeholder="Enter from email"
                          value={step.values.fromEmail}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            const sanitizedValue = rawValue
                              .replace(/\s+/g, "")
                              .toLowerCase();
                            updateStepInState(index, {
                              values: {
                                ...step.values,
                                fromEmail: sanitizedValue,
                              },
                            });
                            // Clear error when user types
                            if (sanitizedValue.trim()) {
                              clearFieldError(stepId, "fromEmail");
                            }
                          }}
                          maxLength={50}
                          className={cn(
                            "bg-background pe-16",
                            emailStepError !== null &&
                              errorStepIds.includes(stepId) &&
                              fieldErrors[stepId]?.includes("fromEmail") &&
                              "border-destructive ring-1 ring-destructive",
                          )}
                        />
                        <span className="absolute bottom-0 right-0 top-0 flex items-center px-2 text-sm text-muted-foreground">
                          {step.values.fromEmail.length} / 50
                        </span>
                      </div>
                      <span className="mb-1 leading-none">@</span>
                      <DomainSelector
                        organizationId={organizationId}
                        onChange={(value) => {
                          updateStepInState(index, {
                            from_email_domain: value ? parseInt(value) : null,
                          });
                          // Clear error when user selects a domain
                          if (value) {
                            clearFieldError(stepId, "domain");
                          }
                        }}
                        value={step.from_email_domain?.toString() || ""}
                        selectFirstOnLoad={false}
                        className={cn(
                          emailStepError !== null &&
                            errorStepIds.includes(stepId) &&
                            fieldErrors[stepId]?.includes("domain") &&
                            "border-destructive ring-1 ring-destructive",
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="mb-1 text-xs">From Name</div>
                    <div className="relative w-full">
                      <Input
                        placeholder="From Name"
                        value={step.values.fromName}
                        onChange={(e) => {
                          updateStepInState(index, {
                            values: {
                              ...step.values,
                              fromName: e.target.value,
                            },
                          });
                          // Clear error when user types
                          if (e.target.value.trim()) {
                            clearFieldError(stepId, "fromName");
                          }
                        }}
                        maxLength={50}
                        className={cn(
                          "bg-background pe-16",
                          emailStepError !== null &&
                            errorStepIds.includes(stepId) &&
                            fieldErrors[stepId]?.includes("fromName") &&
                            "border-destructive ring-1 ring-destructive",
                        )}
                      />
                      <span className="absolute bottom-0 right-0 top-0 flex items-center px-2 text-sm text-muted-foreground">
                        {step.values.fromName.length} / 50
                      </span>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <Button
                      variant="outline"
                      onClick={() => removeStep(index)}
                      className="col-span-4 mt-3 h-7 w-full hover:bg-destructive hover:text-white"
                    >
                      Remove Step
                    </Button>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default function EmailAutomationBuilder({
  organizationId,
  onChangesPending,
  automation,
  activeAutomationMembersCount,
}: {
  organizationId: string;
  onChangesPending: (hasPendingChanges: boolean) => void;
  automation: EmailAutomation;
  activeAutomationMembersCount?: number;
}) {
  const [trigger, setTrigger] = useState<TriggerType | null>(
    automation?.trigger_type || null,
  );
  const [selectedList, setSelectedList] = useState<string>(
    automation?.list_id?.toString() || "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    automation?.email_category_id?.toString() || "",
  );
  const [steps, setSteps] = useState<AutomationStep[]>(
    (automation?.steps || [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((step) => ({
        ...step,
        values: getInitialStepValues(step),
      })),
  );
  const [openStep, setOpenStep] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCancellingRuns, setIsCancellingRuns] = useState(false);

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

  const { mutateAsync: updateAutomation, isPending: isUpdatingAutomation } =
    useMutation({
      mutationFn: updateEmailAutomationAction,
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

  const isSaving =
    isUpdating || isCreating || isDeleting || isUpdatingAutomation;

  // Store initial state for comparison
  const initialState = useRef({
    trigger: automation?.trigger_type || null,
    selectedList: automation?.list_id?.toString() || "",
    selectedCategory: automation?.email_category_id?.toString() || "",
    steps: automation?.steps || [],
  });

  const [waitTimeError, setWaitTimeError] = useState<string | null>(null);
  const [emailStepError, setEmailStepError] = useState<string | null>(null);
  const [errorStepIds, setErrorStepIds] = useState<string[]>([]);
  // Track field-specific errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Function to clear errors for a specific field in a step
  const clearFieldError = useCallback(
    (stepId: string, fieldName: string) => {
      setFieldErrors((prev) => {
        const stepErrors = prev[stepId] || [];
        const newStepErrors = stepErrors.filter((field) => field !== fieldName);

        const newErrors = { ...prev };
        if (newStepErrors.length === 0) {
          delete newErrors[stepId];
          // Also remove from errorStepIds if no more errors
          setErrorStepIds((ids) => ids.filter((id) => id !== stepId));
        } else {
          newErrors[stepId] = newStepErrors;
        }

        return newErrors;
      });

      // If no more field errors across all steps, clear the general error
      if (Object.keys(fieldErrors).length === 0) {
        setEmailStepError(null);
      }
    },
    [fieldErrors],
  );

  // Function to add a new step
  const addStep = (type: ActionType) => {
    // Check if we've reached the maximum number of steps before state update
    if (steps.length >= 10) {
      toast({
        title: "Maximum steps reached",
        description: "You cannot add more than 10 steps to an automation.",
        variant: "destructive",
      });
      return;
    }

    setSteps((prev) => {
      const newOrder =
        prev.length > 0 ? Math.max(...prev.map((s) => s.order || 0)) + 1 : 0;
      const newStep: AutomationStep = {
        type,
        order: newOrder,
        tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        values:
          type === "wait"
            ? { unit: "days", value: "" }
            : { fromName: "", fromEmail: "", subject: "" },
      };
      const newSteps = [...prev, newStep];

      // Set the new step to be open using its tempId (non-undefined)
      setOpenStep(newStep.tempId ?? "");

      return newSteps.map((step, i) => ({ ...step, order: i }));
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
      const oldIndex = steps.findIndex(
        (step) => (step.id?.toString() || step.tempId) === active.id,
      );
      const newIndex = steps.findIndex(
        (step) => (step.id?.toString() || step.tempId) === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
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
    }
  };

  const handleSave = async (confirmedByUser = false) => {
    // If there are active members, show confirmation dialog
    if (
      activeAutomationMembersCount &&
      activeAutomationMembersCount > 0 &&
      !confirmedByUser
    ) {
      setShowConfirmDialog(true);
      return;
    }

    // Reset confirmation state
    setShowConfirmDialog(false);

    // Create a more concise list of error types
    const validationErrors: string[] = [];
    // Track steps with errors
    const stepsWithErrors: string[] = [];

    // Check for consecutive wait steps
    const hasConsecutiveWaits = steps.some(
      (step, index) =>
        step.type === "wait" && steps[index + 1]?.type === "wait",
    );

    if (hasConsecutiveWaits) {
      validationErrors.push("Wait steps cannot be consecutive");
    }

    // Check if the last step is a wait step
    if (steps.length > 0 && steps[steps.length - 1].type === "wait") {
      validationErrors.push("Automation cannot end with a wait step");
    }

    // Check if total steps exceed limit
    if (steps.length > 10) {
      validationErrors.push("Maximum of 10 steps allowed");
    }

    // Clear all error states
    setWaitTimeError(null);
    setEmailStepError(null);
    setErrorStepIds([]);

    // Check for incomplete steps
    let hasIncompleteSteps = false;

    // Validate all wait steps
    const waitSteps = steps.filter(isWaitStep);
    for (const [index, step] of waitSteps.entries()) {
      const stepId = step.id
        ? `step-${step.id}`
        : step.tempId || `temp-${index}`;

      // Check for invalid wait time
      if (step.values.value === "" || typeof step.values.value !== "number") {
        hasIncompleteSteps = true;
        stepsWithErrors.push(stepId);
        setWaitTimeError("Wait time is required");
      }

      // Check for excessive wait time
      const numericValue = step.values.value as number;
      if (
        typeof numericValue === "number" &&
        !(
          (step.values.unit === "hours" && numericValue <= 24) ||
          (step.values.unit === "days" && numericValue <= 31)
        )
      ) {
        hasIncompleteSteps = true;
        stepsWithErrors.push(stepId);
        setWaitTimeError(
          `Maximum wait time is ${step.values.unit === "hours" ? "24 hours" : "31 days"}`,
        );
      }
    }

    // Validate all email steps
    const emailSteps = steps.filter(isEmailStep);
    const newFieldErrors: Record<string, string[]> = {};

    for (const [index, step] of emailSteps.entries()) {
      const stepId = step.id
        ? `step-${step.id}`
        : step.tempId || `temp-${index}`;

      const stepFieldErrors: string[] = [];

      if (!step.email_template) {
        stepFieldErrors.push("template");
      }

      if (!step.values.fromName.trim()) {
        stepFieldErrors.push("fromName");
      }

      if (!step.values.fromEmail.trim()) {
        stepFieldErrors.push("fromEmail");
      }

      if (!step.from_email_domain) {
        stepFieldErrors.push("domain");
      }

      if (!step.values.subject.trim()) {
        stepFieldErrors.push("subject");
      }

      if (stepFieldErrors.length > 0) {
        hasIncompleteSteps = true;
        stepsWithErrors.push(stepId);
        newFieldErrors[stepId] = stepFieldErrors;
      }
    }

    if (hasIncompleteSteps) {
      setFieldErrors(newFieldErrors);
      setEmailStepError("Email step is incomplete");
      validationErrors.push("Some steps are incomplete");
    }

    // Update error step IDs state
    setErrorStepIds(stepsWithErrors);

    // If we have validation errors, display them and stop the save process
    if (validationErrors.length > 0) {
      // Open the first step with an error if there are any
      if (stepsWithErrors.length > 0) {
        setOpenStep(stepsWithErrors[0]);
      }

      // Show unified error toast
      toast({
        title: "Invalid automation",
        description: (
          <ul className="list-disc pl-4">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });

      return;
    }

    try {
      // First update the automation details if trigger or list has changed
      if (
        trigger !== initialState.current.trigger ||
        selectedList !== initialState.current.selectedList ||
        selectedCategory !== initialState.current.selectedCategory
      ) {
        await updateAutomation({
          automation_id: automation.id,
          automation_data: {
            id: automation.id,
            trigger_type: trigger,
            list_id: selectedList ? parseInt(selectedList) : null,
            email_category_id: selectedCategory
              ? parseInt(selectedCategory)
              : null,
            organization_id: automation.organization_id,
            created_at: automation.created_at,
            name: automation.name,
            is_active: automation.is_active,
            updated_at: new Date().toISOString(),
          },
        });
      }

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
        selectedCategory,
        steps: updatedSteps,
      };

      // Update the current steps state with server-assigned IDs
      setSteps(updatedSteps);

      setHasUnsavedChanges(false);
      onChangesPending(false);

      toast({
        title: "Success",
        description: "Automation updated successfully",
      });

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["email-automation", automation.id],
      });
      // Also invalidate the email automations list to reflect changes in listing
      queryClient.invalidateQueries({
        queryKey: ["email-automations", organizationId],
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update automation",
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
  };

  return (
    <div className="flex h-full flex-col px-1.5">
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Warning: Active Members Will Be Affected
            </AlertDialogTitle>
            <AlertDialogDescription>
              There {activeAutomationMembersCount === 1 ? "is" : "are"}{" "}
              {activeAutomationMembersCount} active{" "}
              {activeAutomationMembersCount === 1 ? "member" : "members"} in
              this automation. Saving changes will cancel their current
              automation progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowConfirmDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                try {
                  const response = await fetch("/api/automations/cancel-run", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      automationId: automation.id,
                      reason: "automation updated",
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    console.error(
                      "Failed to cancel automation runs:",
                      errorData.error,
                    );
                    toast({
                      title: "Error",
                      description: `Failed to prepare automation for update: ${errorData.error || "Unknown error"}`,
                      variant: "destructive",
                    });
                    // Optionally stop the save process if canceling runs fails critically
                    return;
                  }
                } catch (error) {
                  console.error("Error calling cancel-run API:", error);
                  toast({
                    title: "Error",
                    description:
                      error instanceof Error
                        ? error.message
                        : "An unexpected error occurred while preparing the automation.",
                    variant: "destructive",
                  });
                  // Optionally stop the save process if canceling runs fails critically
                  return;
                } finally {
                  setIsCancellingRuns(false);
                }
                handleSave(true);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-row justify-between gap-2 pb-2 sm:items-center">
        <div className="text-xl font-semibold">Trigger and Steps</div>
        <div className="flex h-10 flex-row justify-end gap-2">
          {hasUnsavedChanges && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Discard Changes
              </Button>
              <Button
                onClick={() => handleSave()}
                disabled={isSaving || isCancellingRuns}
              >
                {isSaving || isCancellingRuns ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Trigger Section */}
        <div className="space-y-2 pt-4">
          <div className="text-base font-medium text-muted-foreground">
            Trigger
          </div>

          <Card className="relative">
            <CardContent className="p-4">
              <Select
                value={trigger || ""}
                onValueChange={(value: TriggerType) => setTrigger(value)}
              >
                <SelectTrigger className="w-full bg-background">
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
                    <div className="mt-3">
                      <CategorySelector
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        organizationId={organizationId}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="text-base font-medium text-muted-foreground">
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
          >
            <SortableContext
              items={steps.map(
                (step) => step.id?.toString() || step.tempId || "",
              )}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <SortableStep
                    key={step.id?.toString() || step.tempId}
                    step={step}
                    index={index}
                    steps={steps}
                    updateStep={updateStepInState}
                    removeStep={removeStep}
                    waitTimeError={waitTimeError}
                    setWaitTimeError={setWaitTimeError}
                    emailStepError={emailStepError}
                    errorStepIds={errorStepIds}
                    organizationId={organizationId}
                    openItem={openStep}
                    setOpenItem={setOpenStep}
                    fieldErrors={fieldErrors}
                    clearFieldError={clearFieldError}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {!steps.length ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg p-6">
              <div className="relative mb-8 w-64">
                <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <Email height={"20"} width={"20"} />
                    <div className="h-6 w-full rounded bg-muted"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HourglassClock height={"20"} width={"20"} />
                    <div className="h-6 w-full rounded bg-muted"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Email height={"20"} width={"20"} />
                    <div className="h-6 w-full rounded bg-muted"></div>
                  </div>
                </div>
                <div className="absolute -right-3 -top-3 rounded-full border bg-card p-1 shadow-sm">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <h3 className="mb-4 text-center text-xl font-medium text-muted-foreground">
                Add an action to get started
              </h3>
              <div className="flex gap-2">
                <Button
                  className="flex items-center gap-2"
                  onClick={() => addStep("wait")}
                >
                  Add Wait
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => addStep("send_email")}
                >
                  Add Email
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 pt-6">
              <Button
                className="flex items-center gap-2 text-muted-foreground"
                onClick={() => addStep("wait")}
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
                Add Wait
              </Button>
              <Button
                className="flex items-center gap-2 text-muted-foreground"
                onClick={() => addStep("send_email")}
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
                Add Email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

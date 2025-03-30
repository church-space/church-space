"use client";

import { useState } from "react";
import {
  Plus,
  ChevronDown,
  Clock,
  Mail,
  Play,
  X,
  AlertCircle,
  Eye,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@church-space/ui/cn";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import { Button } from "@church-space/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@church-space/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

type TriggerType =
  | "form-submitted"
  | "contact-added"
  | "added-to-workflow"
  | "added-to-workflow-step"
  | "added-to-list"
  | "removed-from-list";
type ActionType = "wait" | "send-email" | "notify-admin";

interface Action {
  id: string;
  type: ActionType;
  config: WaitConfig | EmailConfig | NotifyAdminConfig;
  isExpanded: boolean;
}

interface WaitConfig {
  value: string;
  duration: number;
  unit: "hours" | "days";
}

interface EmailConfig {
  value: string;
  template: string;
  fromName: string;
  fromEmail: string;
  subject: string;
}

interface NotifyAdminConfig {
  value: string;
  email: string;
  message: string;
}

interface TriggerConfig {
  type: TriggerType;
  value: string;
  isExpanded: boolean;
  listId?: string;
  workflowId?: string;
  workflowStepId?: string;
  formId?: string;
}

export default function AutomationBuilder() {
  // Add sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [trigger, setTrigger] = useState<TriggerConfig>({
    type: "form-submitted",
    value: "Form submitted: Contact Form",
    isExpanded: false,
    formId: "form-1",
  });

  const [actions, setActions] = useState<Action[]>([
    {
      id: "action-1",
      type: "wait",
      config: {
        value: "3 Days",
        duration: 3,
        unit: "days",
      },
      isExpanded: false,
    },
    {
      id: "action-2",
      type: "send-email",
      config: {
        value: "Welcome Email",
        template: "welcome-template",
        fromName: "Support Team",
        fromEmail: "support@example.com",
        subject: "Welcome to our platform",
      },
      isExpanded: false,
    },
  ]);

  const [actionToDelete, setActionToDelete] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const addAction = (type: ActionType, index?: number) => {
    const id = `action-${Date.now()}`;
    let newAction: Action = {
      id,
      type: "wait",
      config: {
        value: "1 Day",
        duration: 1,
        unit: "days",
      },
      isExpanded: true,
    };

    if (type === "send-email") {
      newAction = {
        id,
        type: "send-email",
        config: {
          value: "New Email",
          template: "",
          fromName: "Support Team",
          fromEmail: "support@example.com",
          subject: "New Email",
        },
        isExpanded: true,
      };
    } else if (type === "notify-admin") {
      newAction = {
        id,
        type: "notify-admin",
        config: {
          value: "Notify Admin",
          email: "",
          message: "Please review this automation",
        },
        isExpanded: true,
      };
    }

    if (typeof index === "number") {
      setActions([
        ...actions.slice(0, index),
        newAction,
        ...actions.slice(index),
      ]);
    } else {
      setActions([...actions, newAction]);
    }
  };

  const toggleTriggerExpand = () => {
    setTrigger({
      ...trigger,
      isExpanded: !trigger.isExpanded,
    });
  };

  const toggleActionExpand = (id: string) => {
    setActions(
      actions.map((action) =>
        action.id === id
          ? { ...action, isExpanded: !action.isExpanded }
          : action,
      ),
    );
  };

  const updateTriggerConfig = (config: Partial<TriggerConfig>) => {
    const updatedConfig = { ...config };

    // Update the trigger value to include the selected item name
    if (config.formId) {
      const formName = getFormName(config.formId);
      updatedConfig.value = `Form submitted: ${formName}`;
    } else if (config.listId) {
      const listName = getListName(config.listId);
      updatedConfig.value = `${trigger.type === "added-to-list" ? "Added to" : "Removed from"} list: ${listName}`;
    } else if (config.workflowId && !config.workflowStepId) {
      const workflowName = getWorkflowName(config.workflowId);
      updatedConfig.value = `Added to workflow: ${workflowName}`;
    } else if (config.workflowStepId && config.workflowId) {
      const workflowName = getWorkflowName(config.workflowId);
      const stepName = getWorkflowStepName(config.workflowStepId);
      updatedConfig.value = `Added to workflow step: ${workflowName} - ${stepName}`;
    }

    setTrigger({
      ...trigger,
      ...updatedConfig,
    });
  };

  // Helper functions to get names from IDs
  const getFormName = (formId: string): string => {
    switch (formId) {
      case "form-1":
        return "Contact Form";
      case "form-2":
        return "Registration Form";
      case "form-3":
        return "Feedback Form";
      default:
        return "Unknown Form";
    }
  };

  const getListName = (listId: string): string => {
    switch (listId) {
      case "list-1":
        return "Customer List";
      case "list-2":
        return "Newsletter Subscribers";
      case "list-3":
        return "Trial Users";
      default:
        return "Unknown List";
    }
  };

  const getWorkflowName = (workflowId: string): string => {
    switch (workflowId) {
      case "workflow-1":
        return "Onboarding";
      case "workflow-2":
        return "Customer Journey";
      case "workflow-3":
        return "Re-engagement";
      default:
        return "Unknown Workflow";
    }
  };

  const getWorkflowStepName = (stepId: string): string => {
    switch (stepId) {
      case "step-1":
        return "Step 1";
      case "step-2":
        return "Step 2";
      case "step-3":
        return "Step 3";
      default:
        return "Unknown Step";
    }
  };

  const updateWaitConfig = (id: string, config: Partial<WaitConfig>) => {
    setActions(
      actions.map((action) => {
        if (action.id === id && action.type === "wait") {
          const waitConfig = action.config as WaitConfig;
          const updatedConfig = { ...waitConfig, ...config };

          // Update the display value
          updatedConfig.value = `${updatedConfig.duration} ${updatedConfig.unit.charAt(0).toUpperCase() + updatedConfig.unit.slice(1)}`;
          if (updatedConfig.duration === 1) {
            updatedConfig.value = updatedConfig.value.slice(0, -1);
          }

          return { ...action, config: updatedConfig };
        }
        return action;
      }),
    );
  };

  const updateEmailConfig = (id: string, config: Partial<EmailConfig>) => {
    setActions(
      actions.map((action) => {
        if (action.id === id && action.type === "send-email") {
          const emailConfig = action.config as EmailConfig;
          const updatedConfig = { ...emailConfig, ...config };

          // Update the display value if subject changes
          if (config.subject) {
            updatedConfig.value = config.subject;
          } else if (config.template) {
            // If template changes, update the display value
            const templateName = config.template
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            updatedConfig.value = templateName;
          }

          return { ...action, config: updatedConfig };
        }
        return action;
      }),
    );
  };

  const updateNotifyAdminConfig = (
    id: string,
    config: Partial<NotifyAdminConfig>,
  ) => {
    setActions(
      actions.map((action) => {
        if (action.id === id && action.type === "notify-admin") {
          const notifyConfig = action.config as NotifyAdminConfig;
          const updatedConfig = { ...notifyConfig, ...config };

          // Update the display value if email changes
          if (config.email) {
            updatedConfig.value = `Notify ${config.email}`;
          }

          return { ...action, config: updatedConfig };
        }
        return action;
      }),
    );
  };

  const confirmDeleteAction = (id: string) => {
    setActionToDelete(id);
  };

  const removeAction = () => {
    if (actionToDelete) {
      setActions(actions.filter((action) => action.id !== actionToDelete));
      setActionToDelete(null);
    }
  };

  const cancelDeleteAction = () => {
    setActionToDelete(null);
  };

  const openTemplatePreview = (template: string) => {
    setPreviewTemplate(template);
  };

  const closeTemplatePreview = () => {
    setPreviewTemplate(null);
  };

  const getTemplatePreviewContent = (template: string) => {
    switch (template) {
      case "welcome-template":
        return {
          title: "Welcome Template",
          content: (
            <div className="space-y-4">
              <p>Hello [Customer Name],</p>
              <p>
                Welcome to our platform! We&apos;re excited to have you on
                board.
              </p>
              <p>Here are a few things you can do to get started:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Complete your profile</li>
                <li>Explore our features</li>
                <li>Connect with other users</li>
              </ul>
              <p>
                If you have any questions, feel free to reach out to our support
                team.
              </p>
              <p>
                Best regards,
                <br />
                The Support Team
              </p>
            </div>
          ),
        };
      case "follow-up-template":
        return {
          title: "Follow-up Template",
          content: (
            <div className="space-y-4">
              <p>Hello [Customer Name],</p>
              <p>
                We noticed you&apos;ve been using our platform for a week now.
                How has your experience been so far?
              </p>
              <p>
                We&apos;d love to hear your feedback and help you get the most
                out of our services.
              </p>
              <p>
                Feel free to reply to this email with any questions or
                suggestions.
              </p>
              <p>
                Best regards,
                <br />
                The Support Team
              </p>
            </div>
          ),
        };
      case "newsletter-template":
        return {
          title: "Newsletter Template",
          content: (
            <div className="space-y-4">
              <p>Hello [Customer Name],</p>
              <p>Here&apos;s what&apos;s new this month:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>New feature: Advanced reporting</li>
                <li>Improved user interface</li>
                <li>Bug fixes and performance improvements</li>
              </ul>
              <p>
                Check out our blog for more detailed information about these
                updates.
              </p>
              <p>
                Best regards,
                <br />
                The Support Team
              </p>
            </div>
          ),
        };
      default:
        return {
          title: "Template Preview",
          content: <p>No template selected or template not found.</p>,
        };
    }
  };

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case "wait":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
        );
      case "send-email":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100">
            <Mail className="h-5 w-5 text-green-600" />
          </div>
        );
      case "notify-admin":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-100">
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
        );
      default:
        return null;
    }
  };

  const getActionLabel = (type: ActionType) => {
    switch (type) {
      case "wait":
        return "Wait";
      case "send-email":
        return "Send email";
      case "notify-admin":
        return "Notify admin";
      default:
        return "Action";
    }
  };

  const getTriggerContextField = () => {
    switch (trigger.type) {
      case "form-submitted":
        return (
          <div>
            <Label htmlFor="form-id">Form</Label>
            <Select
              value={trigger.formId}
              onValueChange={(value) => updateTriggerConfig({ formId: value })}
            >
              <SelectTrigger id="form-id">
                <SelectValue placeholder="Select a form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form-1">Contact Form</SelectItem>
                <SelectItem value="form-2">Registration Form</SelectItem>
                <SelectItem value="form-3">Feedback Form</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "contact-added":
      case "added-to-list":
      case "removed-from-list":
        return (
          <div>
            <Label htmlFor="list-id">List</Label>
            <Select
              value={trigger.listId}
              onValueChange={(value) => updateTriggerConfig({ listId: value })}
            >
              <SelectTrigger id="list-id">
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list-1">Customer List</SelectItem>
                <SelectItem value="list-2">Newsletter Subscribers</SelectItem>
                <SelectItem value="list-3">Trial Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "added-to-workflow":
        return (
          <div>
            <Label htmlFor="workflow-id">Workflow</Label>
            <Select
              value={trigger.workflowId}
              onValueChange={(value) =>
                updateTriggerConfig({ workflowId: value })
              }
            >
              <SelectTrigger id="workflow-id">
                <SelectValue placeholder="Select a workflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workflow-1">Onboarding</SelectItem>
                <SelectItem value="workflow-2">Customer Journey</SelectItem>
                <SelectItem value="workflow-3">Re-engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "added-to-workflow-step":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="workflow-id">Workflow</Label>
              <Select
                value={trigger.workflowId}
                onValueChange={(value) =>
                  updateTriggerConfig({ workflowId: value })
                }
              >
                <SelectTrigger id="workflow-id">
                  <SelectValue placeholder="Select a workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workflow-1">Onboarding</SelectItem>
                  <SelectItem value="workflow-2">Customer Journey</SelectItem>
                  <SelectItem value="workflow-3">Re-engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workflow-step-id">Workflow Step</Label>
              <Select
                value={trigger.workflowStepId}
                onValueChange={(value) =>
                  updateTriggerConfig({ workflowStepId: value })
                }
              >
                <SelectTrigger id="workflow-step-id">
                  <SelectValue placeholder="Select a workflow step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="step-1">Step 1</SelectItem>
                  <SelectItem value="step-2">Step 2</SelectItem>
                  <SelectItem value="step-3">Step 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setActions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  function SortableAction({
    action,
    index,
  }: {
    action: Action;
    index: number;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: action.id });

    const style = transform
      ? {
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 10 : 1,
        }
      : undefined;

    const handleExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleActionExpand(action.id);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "mb-2 w-full rounded-xl border bg-card shadow-sm",
          isDragging && "opacity-50",
        )}
      >
        <div
          className="flex cursor-pointer items-center p-4"
          onClick={handleExpandClick}
        >
          <div
            className="flex cursor-grab touch-none items-center justify-center"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          {getActionIcon(action.type)}
          <div className="mx-2 text-xl font-bold">
            {getActionLabel(action.type)}
          </div>
          <div className="flex flex-1 items-center justify-between">
            <div>{action.config.value}</div>
            <div className="flex items-center">
              <motion.div
                initial={false}
                animate={{ rotate: action.isExpanded ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="mr-1"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeleteAction(action.id);
                }}
                className="rounded-full p-1 hover:bg-gray-200"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {action.isExpanded && (
            <motion.div
              key={`content-${action.id}`}
              layout="position"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-200 p-4 pt-2">
                {action.type === "wait" && (
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label htmlFor={`${action.id}-duration`}>Duration</Label>
                      <Input
                        id={`${action.id}-duration`}
                        type="number"
                        min="1"
                        value={(action.config as WaitConfig).duration}
                        onChange={(e) =>
                          updateWaitConfig(action.id, {
                            duration: Number.parseInt(e.target.value) || 1,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`${action.id}-unit`}>Unit</Label>
                      <Select
                        value={(action.config as WaitConfig).unit}
                        onValueChange={(value) =>
                          updateWaitConfig(action.id, {
                            unit: value as "hours" | "days",
                          })
                        }
                      >
                        <SelectTrigger
                          id={`${action.id}-unit`}
                          className="mt-1"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {action.type === "send-email" && (
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`${action.id}-template`}>
                          Template
                        </Label>
                        <Select
                          value={(action.config as EmailConfig).template}
                          onValueChange={(value) =>
                            updateEmailConfig(action.id, {
                              template: value,
                            })
                          }
                        >
                          <SelectTrigger
                            id={`${action.id}-template`}
                            className="mt-1"
                          >
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="welcome-template">
                              Welcome Template
                            </SelectItem>
                            <SelectItem value="follow-up-template">
                              Follow-up Template
                            </SelectItem>
                            <SelectItem value="newsletter-template">
                              Newsletter Template
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTemplatePreview(
                            (action.config as EmailConfig).template,
                          );
                        }}
                        disabled={!(action.config as EmailConfig).template}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`${action.id}-from-name`}>
                        From Name
                      </Label>
                      <Input
                        id={`${action.id}-from-name`}
                        value={(action.config as EmailConfig).fromName}
                        onChange={(e) =>
                          updateEmailConfig(action.id, {
                            fromName: e.target.value,
                          })
                        }
                        placeholder="Sender name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${action.id}-from-email`}>
                        From Email
                      </Label>
                      <Input
                        id={`${action.id}-from-email`}
                        type="email"
                        value={(action.config as EmailConfig).fromEmail}
                        onChange={(e) =>
                          updateEmailConfig(action.id, {
                            fromEmail: e.target.value,
                          })
                        }
                        placeholder="sender@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${action.id}-subject`}>Subject</Label>
                      <Input
                        id={`${action.id}-subject`}
                        value={(action.config as EmailConfig).subject}
                        onChange={(e) =>
                          updateEmailConfig(action.id, {
                            subject: e.target.value,
                          })
                        }
                        placeholder="Email subject"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {action.type === "notify-admin" && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`${action.id}-email`}>Admin Email</Label>
                      <Input
                        id={`${action.id}-email`}
                        type="email"
                        value={(action.config as NotifyAdminConfig).email}
                        onChange={(e) =>
                          updateNotifyAdminConfig(action.id, {
                            email: e.target.value,
                          })
                        }
                        placeholder="admin@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${action.id}-message`}>Message</Label>
                      <Input
                        id={`${action.id}-message`}
                        value={(action.config as NotifyAdminConfig).message}
                        onChange={(e) =>
                          updateNotifyAdminConfig(action.id, {
                            message: e.target.value,
                          })
                        }
                        placeholder="Notification message"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  function ActionAddButton({
    index,
    isLast,
  }: {
    index: number;
    isLast?: boolean;
  }) {
    return (
      <div className="group/add relative">
        {!isLast && (
          <div className="flex justify-center">
            <div className="h-5 border-l-2 border-dashed border-gray-300"></div>
          </div>
        )}
        <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-center opacity-0 transition-opacity group-hover/add:opacity-100">
          <Popover>
            <PopoverTrigger asChild>
              <button className="rounded-full bg-gray-200 p-2 shadow-sm transition-colors hover:bg-gray-300">
                <Plus className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="center">
              <div className="grid gap-1 p-2">
                <Button
                  onClick={() => addAction("wait", index)}
                  className="flex h-10 items-center justify-start gap-2"
                  variant="ghost"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span>Wait</span>
                </Button>
                <Button
                  onClick={() => addAction("send-email", index)}
                  className="flex h-10 items-center justify-start gap-2"
                  variant="ghost"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-green-100">
                    <Mail className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span>Send Email</span>
                </Button>
                <Button
                  onClick={() => addAction("notify-admin", index)}
                  className="flex h-10 items-center justify-start gap-2"
                  variant="ghost"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-100">
                    <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <span>Notify Admin</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-pattern min-h-screen py-10">
      <div className="container mx-auto max-w-xl py-6">
        <div className="space-y-0">
          {/* Trigger */}
          <div className="overflow-hidden rounded-xl bg-card shadow-sm">
            <div
              className="flex cursor-pointer items-center p-4"
              onClick={toggleTriggerExpand}
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center rounded bg-muted">
                <Play className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mr-4 text-xl font-bold">When</div>
              <div className="flex flex-1 items-center justify-between">
                <div>{trigger.value}</div>
                <motion.div
                  initial={false}
                  animate={{ rotate: trigger.isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {trigger.isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="border-t p-4 pt-2">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="trigger-type">Trigger Type</Label>
                        <Select
                          value={trigger.type}
                          onValueChange={(value) => {
                            const triggerType = value as TriggerType;
                            let newValue = "";
                            const newConfig: Partial<TriggerConfig> = {
                              type: triggerType,
                            };

                            switch (triggerType) {
                              case "form-submitted":
                                newConfig.formId = "form-1";
                                newValue = `Form submitted: ${getFormName("form-1")}`;
                                break;
                              case "contact-added":
                                newValue = "Contact added";
                                break;
                              case "added-to-list":
                                newConfig.listId = "list-1";
                                newValue = `Added to list: ${getListName("list-1")}`;
                                break;
                              case "removed-from-list":
                                newConfig.listId = "list-1";
                                newValue = `Removed from list: ${getListName("list-1")}`;
                                break;
                              case "added-to-workflow":
                                newConfig.workflowId = "workflow-1";
                                newValue = `Added to workflow: ${getWorkflowName("workflow-1")}`;
                                break;
                              case "added-to-workflow-step":
                                newConfig.workflowId = "workflow-1";
                                newConfig.workflowStepId = "step-1";
                                newValue = `Added to workflow step: ${getWorkflowName("workflow-1")} - ${getWorkflowStepName("step-1")}`;
                                break;
                            }

                            updateTriggerConfig({
                              ...newConfig,
                              value: newValue,
                            });
                          }}
                        >
                          <SelectTrigger id="trigger-type">
                            <SelectValue placeholder="Select trigger type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="added-to-list">
                              Added to list
                            </SelectItem>
                            <SelectItem value="removed-from-list">
                              Removed from list
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {getTriggerContextField()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dashed line connector from trigger to first action */}
          <div className="-mt-0 mb-4 flex justify-center">
            <div className="h-12 border-l-2 border-dashed border-gray-300"></div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            {/* Add action button above first action */}
            <ActionAddButton index={0} />

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
                items={actions.map((action) => action.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="w-full">
                  {actions.map((action, index) => (
                    <div key={action.id}>
                      <SortableAction action={action} index={index} />
                      <ActionAddButton
                        index={index + 1}
                        isLast={index === actions.length - 1}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!actionToDelete}
          onOpenChange={(open) => !open && cancelDeleteAction()}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove this action from your automation. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={removeAction}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Template Preview Dialog */}
        <Dialog
          open={!!previewTemplate}
          onOpenChange={(open) => !open && closeTemplatePreview()}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {previewTemplate
                  ? getTemplatePreviewContent(previewTemplate).title
                  : "Template Preview"}
              </DialogTitle>
              <DialogDescription>
                Preview of the email template that will be sent.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border bg-white p-4">
              {previewTemplate &&
                getTemplatePreviewContent(previewTemplate).content}
            </div>
            <DialogFooter>
              <Button onClick={closeTemplatePreview}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

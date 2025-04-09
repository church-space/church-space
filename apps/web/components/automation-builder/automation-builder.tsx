"use client";

import { useState } from "react";
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
import { Textarea } from "@church-space/ui/textarea";
import { Switch } from "@church-space/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { SheetTitle, SheetHeader, SheetFooter } from "@church-space/ui/sheet";
import ListSelector from "../id-pages/emails/list-selector";
import EmailTemplateSelector from "./email-template-selector";
import DomainSelector from "../id-pages/emails/domain-selector";

type TriggerType = "person_added" | "person_removed";
type ActionType = "notify_admin" | "wait" | "send_email";

export default function EmailAutomationBuilder({
  organizationId,
}: {
  organizationId: string;
}) {
  const [trigger, setTrigger] = useState<TriggerType | null>(null);
  const [selectedList, setSelectedList] = useState<string>("");

  const [actions, setActions] = useState({
    notify_admin: { enabled: false, email: "", subject: "", message: "" },
    wait: { enabled: false, unit: "days", value: 1 },
    send_email: {
      enabled: false,
      template: "",
      fromName: "",
      fromEmail: "",
      subject: "",
    },
  });

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

  const emailTemplates = [
    "Welcome Email",
    "Thank You",
    "Follow Up",
    "Newsletter",
  ];

  return (
    <>
      <SheetHeader>
        <SheetTitle>Automation Steps</SheetTitle>
      </SheetHeader>

      <div className="space-y-6 p-4">
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

          {/* Notify Admin Action */}
          <Card
            className={cn(
              "relative border-dashed",
              actions.notify_admin.enabled ? "border-primary" : "border-border",
            )}
          >
            <CardContent className="p-0">
              <div className="flex h-14 w-full items-center px-4">
                <div className="flex w-full items-center gap-2">
                  <Switch
                    checked={actions.notify_admin.enabled}
                    onCheckedChange={() => toggleAction("notify_admin")}
                  />
                  <span
                    className={cn(
                      "flex-1 cursor-pointer font-medium",
                      actions.notify_admin.enabled
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                    onClick={() => {
                      toggleAction("notify_admin");
                    }}
                  >
                    Notify Admin
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {actions.notify_admin.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 px-4 pb-4">
                      <div>
                        <div className="mb-1 text-xs">Admin Email</div>
                        <Input
                          placeholder="admin@example.com"
                          value={actions.notify_admin.email}
                          onChange={(e) =>
                            updateActionField(
                              "notify_admin",
                              "email",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs">Subject</div>
                        <Input
                          placeholder="Notification Subject"
                          value={actions.notify_admin.subject}
                          onChange={(e) =>
                            updateActionField(
                              "notify_admin",
                              "subject",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs">Message</div>
                        <Textarea
                          placeholder="Notification message..."
                          className="min-h-[80px]"
                          value={actions.notify_admin.message}
                          onChange={(e) =>
                            updateActionField(
                              "notify_admin",
                              "message",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <div className="absolute -bottom-4 left-1/2 z-10 -ml-0.5 h-4 w-0.5 bg-border"></div>
          </Card>

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
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min={1}
                          max={actions.wait.unit === "days" ? 31 : 23}
                          className="w-20"
                          value={actions.wait.value}
                          onChange={(e) =>
                            updateActionField(
                              "wait",
                              "value",
                              Number.parseInt(e.target.value) || 1,
                            )
                          }
                        />
                        <Select
                          value={actions.wait.unit}
                          onValueChange={(value) =>
                            updateActionField("wait", "unit", value)
                          }
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <div className="absolute -bottom-4 left-1/2 z-10 -ml-0.5 h-4 w-0.5 bg-border"></div>
          </Card>

          {/* Send Email Action */}
          <Card
            className={cn(
              "relative border-dashed",
              actions.send_email.enabled ? "border-primary" : "border-border",
            )}
          >
            <CardContent className="p-0">
              <div className="flex h-14 w-full items-center px-4">
                <div className="flex w-full items-center gap-2">
                  <Switch
                    checked={actions.send_email.enabled}
                    onCheckedChange={() => toggleAction("send_email")}
                  />
                  <span
                    className={cn(
                      "flex-1 cursor-pointer font-medium",
                      actions.send_email.enabled
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                    onClick={() => {
                      toggleAction("send_email");
                    }}
                  >
                    Send Email
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {actions.send_email.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
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
                              updateActionField(
                                "send_email",
                                "fromEmail",
                                value,
                              )
                            }
                            value={actions.send_email.fromEmail}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs">Subject</div>
                        <Input
                          placeholder="Email Subject"
                          value={actions.send_email.subject}
                          onChange={(e) =>
                            updateActionField(
                              "send_email",
                              "subject",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <SheetFooter className="flex items-center justify-end gap-2 border-t p-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </SheetFooter>
    </>
  );
}

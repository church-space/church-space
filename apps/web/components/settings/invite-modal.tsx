"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@church-space/ui/dialog";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Button } from "@church-space/ui/button";
import { useToast } from "@church-space/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Member {
  email: string;
  role: string;
}

interface InviteModalProps {
  organizationId: string;
}

export function InviteModal({ organizationId }: InviteModalProps) {
  const [members, setMembers] = useState<Member[]>([
    { email: "", role: "member" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddMember = () => {
    if (members.length < 10) {
      setMembers([...members, { email: "", role: "member" }]);
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index].email = value;
    setMembers(newMembers);
  };

  const handleRoleChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index].role = value;
    setMembers(newMembers);
  };

  const handleSubmit = async () => {
    // Validate all emails
    const invalidEmails = members.some(
      (member) => !validateEmail(member.email),
    );
    if (invalidEmails) {
      toast({
        title: "Invalid email addresses",
        description: "Please check all email addresses are valid",
        variant: "destructive",
      });
      return;
    }

    // Remove any duplicate emails
    const uniqueEmails = new Set(members.map((m) => m.email));
    if (uniqueEmails.size !== members.length) {
      toast({
        title: "Duplicate emails",
        description: "Please remove duplicate email addresses",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/organization/invite-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_id: organizationId,
          members: members,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invites: " + response.statusText);
      }

      toast({
        title: "Invites sent successfully",
        description: "Your invitations have been sent",
      });

      // Invalidate the queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["organization-invites", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-members", organizationId],
      });

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error sending invites",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Invite Member</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Invite up to 10 members to your organization. They will receive an
              email invitation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[1fr,200px,40px] items-center gap-4 px-1">
              <Label>Email</Label>
              <Label>Role</Label>
              <div />
            </div>

            <AnimatePresence>
              {members.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-[1fr,200px,40px] items-center gap-4"
                >
                  <Input
                    placeholder="email@example.com"
                    value={member.email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                    className={
                      !validateEmail(member.email) && member.email
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(index)}
                    disabled={members.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              onClick={handleAddMember}
              disabled={members.length >= 10}
              className="w-full"
            >
              Add Another Member
            </Button>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Sending Invites..." : "Send Invites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VendorAPI } from "@/lib/api";
import { useVendor } from "@/components/VendorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { 
  Users, Mail, UserPlus, MoreVertical, Loader2, UserX, Shield, ShieldAlert, 
  Send, RefreshCw, XCircle, Building2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function TeamPage() {
  const queryClient = useQueryClient();
  const { activeVendorId, activeVendor } = useVendor();

  const [activeTab, setActiveTab] = useState<"members" | "invites">("members");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionVariant?: "default" | "destructive";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionLabel: "",
    actionVariant: "default",
    onConfirm: () => {},
  });

  const openConfirm = (title: string, description: string, actionLabel: string, actionVariant: "default" | "destructive", onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, description, actionLabel, actionVariant, onConfirm });
  };

  // Queries
  const { data: membersRes, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members", activeVendorId],
    queryFn: () => VendorAPI.getMembers(activeVendorId!),
    enabled: !!activeVendorId,
  });

  const { data: invitesRes, isLoading: isInvitesLoading } = useQuery({
    queryKey: ["invites", activeVendorId],
    queryFn: () => VendorAPI.getPendingInvites(activeVendorId!),
    enabled: !!activeVendorId,
  });

  const members = membersRes?.data?.content || [];
  const invites = invitesRes?.data || [];

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (email: string) => VendorAPI.inviteStaff(activeVendorId!, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", activeVendorId] });
      queryClient.invalidateQueries({ queryKey: ["members", activeVendorId] });
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setActiveTab("invites");
      toast.success("Staff invitation sent successfully!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to invite staff."),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: "VENDOR_ADMIN" | "VENDOR_STAFF" }) => 
      VendorAPI.changeMemberRole(activeVendorId!, userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", activeVendorId] });
      toast.success("Role updated successfully.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update role."),
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => VendorAPI.toggleStaffSuspension(activeVendorId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", activeVendorId] });
      toast.success("Suspension status updated.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update suspension status."),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => VendorAPI.removeStaff(activeVendorId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", activeVendorId] });
      toast.success("Staff member removed successfully.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove staff."),
  });

  const resendInviteMutation = useMutation({
    mutationFn: (inviteId: string) => VendorAPI.resendInvite(activeVendorId!, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", activeVendorId] });
      toast.success("Invitation resent successfully!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to resend invitation."),
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (inviteId: string) => VendorAPI.cancelInvite(activeVendorId!, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", activeVendorId] });
      toast.success("Invitation cancelled.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to cancel invitation."),
  });

  // Handlers
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(inviteEmail);
  };

  if (!activeVendorId) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Active Vendor</h2>
        <p className="text-muted-foreground mt-2 mb-6">Select a vendor workspace to manage your team.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage staff and roles for <span className="font-semibold text-foreground">{activeVendor?.name || "your organization"}</span>
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2 shadow-md hover:shadow-lg">
          <UserPlus className="w-4 h-4" /> Invite Staff
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "members"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Active Members <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs">{members.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("invites")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "invites"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Pending Invites <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs">{invites.length}</span>
        </button>
      </div>

      {/* Content */}
      <div className="pt-2">
        {activeTab === "members" && (
          <Card className="shadow-xs border-border/60">
            <CardContent className="p-0">
              {isMembersLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No active members found</h3>
                  <p className="text-muted-foreground">You are the only member in this organization.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {members.map((member: any) => (
                    <div key={member.memberId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold shrink-0">
                          {member.firstName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">
                              {member.firstName} {member.lastName}
                            </h4>
                            {!member.active && (
                              <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase">
                                Suspended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="text-sm">
                          {member.role === "VENDOR_ADMIN" ? (
                            <span className="flex items-center text-brand-600 dark:text-brand-400 font-medium">
                              <Shield className="w-3.5 h-3.5 mr-1" /> Admin
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Staff</span>
                          )}
                        </div>
                        
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content className="z-[100] min-w-[160px] bg-card border border-border p-1 rounded-md shadow-lg" align="end">
                            <DropdownMenu.Item 
                              onSelect={() => openConfirm(
                                "Change Role",
                                `Are you sure you want to change ${member.firstName}'s role to ${member.role === "VENDOR_ADMIN" ? "Staff" : "Admin"}?`,
                                "Yes, Change Role",
                                "default",
                                () => changeRoleMutation.mutate({ 
                                  userId: member.userId, 
                                  newRole: member.role === "VENDOR_ADMIN" ? "VENDOR_STAFF" : "VENDOR_ADMIN" 
                                })
                              )}
                              className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-muted rounded-sm"
                            >
                              <ShieldAlert className="w-4 h-4 mr-2 text-muted-foreground" />
                              {member.role === "VENDOR_ADMIN" ? "Demote to Staff" : "Promote to Admin"}
                            </DropdownMenu.Item>
                            
                            <DropdownMenu.Item 
                              onSelect={() => openConfirm(
                                member.active ? "Suspend Member" : "Unsuspend Member",
                                `Are you sure you want to ${member.active ? "suspend" : "unsuspend"} ${member.firstName}?`,
                                member.active ? "Yes, Suspend" : "Yes, Unsuspend",
                                member.active ? "destructive" : "default",
                                () => suspendMutation.mutate(member.userId)
                              )}
                              className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-muted rounded-sm text-yellow-600 dark:text-yellow-500"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              {member.active ? "Suspend User" : "Unsuspend User"}
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="h-px bg-border my-1" />

                            <DropdownMenu.Item 
                              onSelect={() => openConfirm(
                                "Remove Member",
                                `Are you sure you want to completely remove ${member.firstName} from your organization? They will lose all access.`,
                                "Yes, Remove",
                                "destructive",
                                () => removeMutation.mutate(member.userId)
                              )}
                              className="flex items-center px-2 py-2 text-sm outline-none cursor-pointer hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 rounded-sm text-red-600 dark:text-red-500"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "invites" && (
          <Card className="shadow-xs border-border/60">
            <CardContent className="p-0">
              {isInvitesLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
              ) : invites.length === 0 ? (
                <div className="text-center py-20">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No pending invites</h3>
                  <p className="text-muted-foreground">All invited members have joined the platform.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {invites.map((invite: any) => (
                    <div key={invite.inviteId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{invite.email}</h4>
                          <p className="text-xs text-muted-foreground">
                            Invited on {invite.invitedAt ? format(new Date(invite.invitedAt), "MMM d, yyyy") : "Unknown"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => openConfirm(
                            "Resend Invitation",
                            `Are you sure you want to resend the invitation email to ${invite.email}?`,
                            "Yes, Resend",
                            "default",
                            () => resendInviteMutation.mutate(invite.inviteId)
                          )}
                          disabled={resendInviteMutation.isPending}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1.5 ${resendInviteMutation.isPending ? 'animate-spin' : ''}`} /> 
                          Resend
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => openConfirm(
                            "Cancel Invitation",
                            `Are you sure you want to cancel the invitation for ${invite.email}? This link will become invalid immediately.`,
                            "Yes, Cancel",
                            "destructive",
                            () => cancelInviteMutation.mutate(invite.inviteId)
                          )}
                          disabled={cancelInviteMutation.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1.5" /> 
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invite Modal */}
      <Modal open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <ModalContent className="sm:max-w-[425px]">
          <form onSubmit={handleInvite}>
            <ModalHeader>
              <ModalTitle>Invite Staff Member</ModalTitle>
              <ModalDescription>
                Send an invitation email to add a new member to your vendor organization.
              </ModalDescription>
            </ModalHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending} className="min-w-[120px]">
                {inviteMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Send Invite</>
                )}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal */}
      <Modal open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}>
        <ModalContent className="sm:max-w-[425px]">
          <ModalHeader>
            <ModalTitle>{confirmModal.title}</ModalTitle>
            <ModalDescription>
              {confirmModal.description}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button 
              variant={confirmModal.actionVariant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
              }}
            >
              {confirmModal.actionLabel}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

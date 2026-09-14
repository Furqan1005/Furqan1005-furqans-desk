"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIssuesStore } from "@/lib/store/issues-store";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, type Issue, type IssuePriority, type IssueStatus } from "@/lib/types";
import { IntakeDetailsFields, type IntakeDetailsValues } from "./intake-details-fields";

export function EditIssueDialog({
  issue,
  open,
  onOpenChange,
}: {
  issue: Issue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const settings = useIssuesStore((s) => s.settings);
  const categories = settings?.categories ?? [];

  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description ?? "");
  const [category, setCategory] = useState(issue.category ?? "");
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [assignedTo, setAssignedTo] = useState(issue.assigned_to ?? "");
  const [startDate, setStartDate] = useState(issue.start_date ?? "");
  const [deadline, setDeadline] = useState(issue.deadline ?? "");
  const [fixedDate, setFixedDate] = useState(issue.fixed_date ?? "");
  const [remarks, setRemarks] = useState(issue.remarks ?? "");
  const [intake, setIntake] = useState<IntakeDetailsValues>({
    requestedBy: issue.requested_by ?? "",
    usefulForTeam: issue.useful_for_team ?? "",
    reasonPainPoint: issue.reason_pain_point ?? "",
    currentlySoftware: issue.currently_software ?? "",
    sourceSoftware: issue.source_software ?? "",
    requestType: issue.request_type ?? "",
    duplicate: issue.duplicate ?? "",
    autoSchedule: issue.auto_schedule ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const changes: string[] = [];
    if (status !== issue.status) changes.push(`Status changed: ${issue.status} -> ${status}`);
    if (priority !== issue.priority)
      changes.push(`Priority changed: ${issue.priority} -> ${priority}`);
    if ((issue.assigned_to ?? "") !== assignedTo.trim())
      changes.push(`Reassigned to ${assignedTo.trim() || "unassigned"}`);
    if (changes.length === 0) changes.push(`Issue details updated: "${title.trim()}"`);

    const { error } = await updateIssue(
      issue.id,
      {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        status,
        priority,
        assigned_to: assignedTo.trim() || null,
        start_date: startDate || null,
        deadline: deadline || null,
        fixed_date: fixedDate || null,
        remarks: remarks.trim() || null,
        requested_by: intake.requestedBy.trim() || null,
        useful_for_team: intake.usefulForTeam.trim() || null,
        reason_pain_point: intake.reasonPainPoint.trim() || null,
        currently_software: intake.currentlySoftware.trim() || null,
        source_software: intake.sourceSoftware.trim() || null,
        request_type: intake.requestType.trim() || null,
        duplicate: intake.duplicate.trim() || null,
        auto_schedule: intake.autoSchedule.trim() || null,
      },
      changes.join("; ")
    );

    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Issue updated.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ei-title">Title</Label>
            <Input id="ei-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ei-description">Description</Label>
            <Textarea
              id="ei-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ei-category">Category</Label>
              <Input
                id="ei-category"
                list="category-options-edit"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="category-options-edit">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ei-assigned">Assigned to</Label>
              <Input
                id="ei-assigned"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as IssuePriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ei-start">Start date</Label>
              <Input
                id="ei-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ei-deadline">Deadline</Label>
              <Input
                id="ei-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ei-fixed">Fixed date</Label>
              <Input
                id="ei-fixed"
                type="date"
                value={fixedDate}
                onChange={(e) => setFixedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ei-remarks">Remarks</Label>
            <Textarea id="ei-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>

          <IntakeDetailsFields
            idPrefix="ei"
            values={intake}
            onChange={(patch) => setIntake((prev) => ({ ...prev, ...patch }))}
            defaultOpen={Object.values(intake).some(Boolean)}
          />

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

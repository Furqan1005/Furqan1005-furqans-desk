"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface IntakeDetailsValues {
  requestedBy: string;
  usefulForTeam: string;
  reasonPainPoint: string;
  currentlySoftware: string;
  sourceSoftware: string;
  requestType: string;
  duplicate: string;
  autoSchedule: string;
}

export const EMPTY_INTAKE_DETAILS: IntakeDetailsValues = {
  requestedBy: "",
  usefulForTeam: "",
  reasonPainPoint: "",
  currentlySoftware: "",
  sourceSoftware: "",
  requestType: "",
  duplicate: "",
  autoSchedule: "",
};

export function IntakeDetailsFields({
  values,
  onChange,
  idPrefix,
  defaultOpen = false,
}: {
  values: IntakeDetailsValues;
  onChange: (patch: Partial<IntakeDetailsValues>) => void;
  idPrefix: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  function field<K extends keyof IntakeDetailsValues>(key: K) {
    return {
      value: values[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value }),
    };
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between text-sm font-medium text-muted-foreground"
      >
        More details (requester, software, request type…)
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-requested-by`}>Requested by</Label>
              <Input id={`${idPrefix}-requested-by`} placeholder="e.g. Kunal Tawade" {...field("requestedBy")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-useful-for-team`}>Useful for team</Label>
              <Input
                id={`${idPrefix}-useful-for-team`}
                placeholder="e.g. CRM, EXIM team"
                {...field("usefulForTeam")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-reason`}>Reason / Pain point</Label>
            <Textarea
              id={`${idPrefix}-reason`}
              placeholder="Why this is needed…"
              value={values.reasonPainPoint}
              onChange={(e) => onChange({ reasonPainPoint: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-currently-software`}>Currently software</Label>
              <Input
                id={`${idPrefix}-currently-software`}
                placeholder="e.g. Utility"
                {...field("currentlySoftware")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-source-software`}>Source software</Label>
              <Input id={`${idPrefix}-source-software`} placeholder="e.g. Hashtag" {...field("sourceSoftware")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-request-type`}>Request type</Label>
              <Input
                id={`${idPrefix}-request-type`}
                placeholder="e.g. Data Request, Automation"
                {...field("requestType")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-auto-schedule`}>Auto schedule</Label>
              <Input id={`${idPrefix}-auto-schedule`} placeholder="Yes / No" {...field("autoSchedule")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-duplicate`}>Duplicate</Label>
            <Input
              id={`${idPrefix}-duplicate`}
              placeholder="Note if this duplicates another request"
              {...field("duplicate")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

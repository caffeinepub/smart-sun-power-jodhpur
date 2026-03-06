import React from "react";
import { EmployeeRole, SiteStatus, TaskStatus } from "../backend.d";

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const classMap: Record<SiteStatus, string> = {
    [SiteStatus.pending]: "badge-pending",
    [SiteStatus.inProgress]: "badge-in-progress",
    [SiteStatus.completed]: "badge-completed",
  };
  const labelMap: Record<SiteStatus, string> = {
    [SiteStatus.pending]: "Pending",
    [SiteStatus.inProgress]: "In Progress",
    [SiteStatus.completed]: "Completed",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classMap[status]}`}
    >
      {labelMap[status]}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const classMap: Record<TaskStatus, string> = {
    [TaskStatus.pending]: "badge-pending",
    [TaskStatus.completed]: "badge-completed",
  };
  const labelMap: Record<TaskStatus, string> = {
    [TaskStatus.pending]: "Pending",
    [TaskStatus.completed]: "Completed",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classMap[status]}`}
    >
      {labelMap[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: EmployeeRole }) {
  const classMap: Record<EmployeeRole, string> = {
    [EmployeeRole.telecaller]: "badge-telecaller",
    [EmployeeRole.marketingStaff]: "badge-marketing",
    [EmployeeRole.fieldWorker]: "badge-field-worker",
    [EmployeeRole.manager]: "badge-manager",
    [EmployeeRole.marketManager]: "badge-market-manager",
  };
  const labelMap: Record<EmployeeRole, string> = {
    [EmployeeRole.telecaller]: "Telecaller",
    [EmployeeRole.marketingStaff]: "Marketing Staff",
    [EmployeeRole.fieldWorker]: "Field Worker",
    [EmployeeRole.manager]: "Manager",
    [EmployeeRole.marketManager]: "Market Manager",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classMap[role]}`}
    >
      {labelMap[role]}
    </span>
  );
}

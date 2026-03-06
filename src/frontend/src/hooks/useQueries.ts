import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Customer,
  type DashboardStats,
  type Employee,
  EmployeeRole,
  SiteStatus,
  type Task,
  TaskStatus,
} from "../backend.d";
import { useActor } from "./useActor";

// Re-export types for convenience
export type { Customer, Employee, Task, DashboardStats };
export { SiteStatus, EmployeeRole, TaskStatus };

const today = () => new Date().toISOString().split("T")[0];

// ─── Dashboard ──────────────────────────────────────────────────────────────
export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats", today()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardStats(today());
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Customers ──────────────────────────────────────────────────────────────
export function useCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      address: string;
      systemSizeKW: number;
      totalAmount: number;
      amountReceived: number;
      siteStatus: SiteStatus;
      assignedEmployeeId: bigint | null;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.createCustomer(
        data.name,
        data.phone,
        data.address,
        data.systemSizeKW,
        data.totalAmount,
        data.amountReceived,
        data.siteStatus,
        data.assignedEmployeeId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      phone: string;
      address: string;
      systemSizeKW: number;
      totalAmount: number;
      amountReceived: number;
      siteStatus: SiteStatus;
      assignedEmployeeId: bigint | null;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.updateCustomer(
        data.id,
        data.name,
        data.phone,
        data.address,
        data.systemSizeKW,
        data.totalAmount,
        data.amountReceived,
        data.siteStatus,
        data.assignedEmployeeId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not ready");
      return actor.deleteCustomer(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ─── Employees ──────────────────────────────────────────────────────────────
export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      role: EmployeeRole;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.createEmployee(data.name, data.phone, data.role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      phone: string;
      role: EmployeeRole;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.updateEmployee(data.id, data.name, data.phone, data.role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not ready");
      return actor.deleteEmployee(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export function useTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      assignedEmployeeId: bigint | null;
      status: TaskStatus;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.createTask(
        data.title,
        data.description,
        data.assignedEmployeeId,
        data.status,
        data.dueDate,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      assignedEmployeeId: bigint | null;
      status: TaskStatus;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.updateTask(
        data.id,
        data.title,
        data.description,
        data.assignedEmployeeId,
        data.status,
        data.dueDate,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not ready");
      return actor.deleteTask(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

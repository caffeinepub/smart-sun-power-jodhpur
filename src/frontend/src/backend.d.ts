import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Customer {
    id: bigint;
    name: string;
    createdAt: bigint;
    siteStatus: SiteStatus;
    assignedEmployeeId?: bigint;
    totalAmount: number;
    address: string;
    systemSizeKW: number;
    phone: string;
    amountReceived: number;
}
export interface Task {
    id: bigint;
    status: TaskStatus;
    title: string;
    createdAt: bigint;
    dueDate: string;
    description: string;
    assignedEmployeeId?: bigint;
}
export interface Employee {
    id: bigint;
    name: string;
    createdAt: bigint;
    role: EmployeeRole;
    phone: string;
}
export interface DashboardStats {
    pendingSites: bigint;
    inProgressSites: bigint;
    totalAmountReceived: number;
    completedSites: bigint;
    totalCustomers: bigint;
    todayTasksCount: bigint;
    totalAmountPending: number;
}
export interface UserProfile {
    name: string;
}
export enum EmployeeRole {
    manager = "manager",
    marketManager = "marketManager",
    marketingStaff = "marketingStaff",
    telecaller = "telecaller",
    fieldWorker = "fieldWorker"
}
export enum SiteStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomer(name: string, phone: string, address: string, systemSizeKW: number, totalAmount: number, amountReceived: number, siteStatus: SiteStatus, assignedEmployeeId: bigint | null): Promise<bigint>;
    createEmployee(name: string, phone: string, role: EmployeeRole): Promise<bigint>;
    createTask(title: string, description: string, assignedEmployeeId: bigint | null, status: TaskStatus, dueDate: string): Promise<bigint>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteEmployee(id: bigint): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllTasks(): Promise<Array<Task>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: bigint): Promise<Customer>;
    getDashboardStats(todayDate: string): Promise<DashboardStats>;
    getEmployee(id: bigint): Promise<Employee>;
    getTask(id: bigint): Promise<Task>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomer(id: bigint, name: string, phone: string, address: string, systemSizeKW: number, totalAmount: number, amountReceived: number, siteStatus: SiteStatus, assignedEmployeeId: bigint | null): Promise<void>;
    updateEmployee(id: bigint, name: string, phone: string, role: EmployeeRole): Promise<void>;
    updateTask(id: bigint, title: string, description: string, assignedEmployeeId: bigint | null, status: TaskStatus, dueDate: string): Promise<void>;
}

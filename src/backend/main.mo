import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type EmployeeRole = {
    #telecaller;
    #marketingStaff;
    #fieldWorker;
    #manager;
    #marketManager;
  };

  type SiteStatus = {
    #pending;
    #inProgress;
    #completed;
  };

  type TaskStatus = {
    #pending;
    #completed;
  };

  public type Employee = {
    id : Nat;
    name : Text;
    phone : Text;
    role : EmployeeRole;
    createdAt : Int;
  };

  public type Customer = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
    systemSizeKW : Float;
    totalAmount : Float;
    amountReceived : Float;
    siteStatus : SiteStatus;
    assignedEmployeeId : ?Nat;
    createdAt : Int;
  };

  public type Task = {
    id : Nat;
    title : Text;
    description : Text;
    assignedEmployeeId : ?Nat;
    status : TaskStatus;
    dueDate : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  public type DashboardStats = {
    totalCustomers : Nat;
    completedSites : Nat;
    pendingSites : Nat;
    inProgressSites : Nat;
    totalAmountReceived : Float;
    totalAmountPending : Float;
    todayTasksCount : Nat;
  };

  // Comparison modules
  module Employee {
    public func compare(a : Employee, b : Employee) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Customer {
    public func compare(a : Customer, b : Customer) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Task {
    public func compare(a : Task, b : Task) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // State
  let employees = Map.empty<Nat, Employee>();
  let customers = Map.empty<Nat, Customer>();
  let tasks = Map.empty<Nat, Task>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextEmployeeId = 1;
  var nextCustomerId = 1;
  var nextTaskId = 1;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Employee CRUD
  public shared ({ caller }) func createEmployee(name : Text, phone : Text, role : EmployeeRole) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create employees");
    };

    let id = nextEmployeeId;
    nextEmployeeId += 1;

    let employee : Employee = {
      id;
      name;
      phone;
      role;
      createdAt = Time.now();
    };

    employees.add(id, employee);
    id;
  };

  public query ({ caller }) func getEmployee(id : Nat) : async Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employees");
    };

    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee does not exist") };
      case (?employee) { employee };
    };
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employees");
    };

    employees.values().toArray().sort();
  };

  public shared ({ caller }) func updateEmployee(id : Nat, name : Text, phone : Text, role : EmployeeRole) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update employees");
    };

    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee does not exist") };
      case (?employee) {
        let updatedEmployee : Employee = {
          id;
          name;
          phone;
          role;
          createdAt = employee.createdAt;
        };
        employees.add(id, updatedEmployee);
      };
    };
  };

  public shared ({ caller }) func deleteEmployee(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete employees");
    };

    employees.remove(id);
  };

  // Customer CRUD
  public shared ({ caller }) func createCustomer(
    name : Text,
    phone : Text,
    address : Text,
    systemSizeKW : Float,
    totalAmount : Float,
    amountReceived : Float,
    siteStatus : SiteStatus,
    assignedEmployeeId : ?Nat
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create customers");
    };

    let id = nextCustomerId;
    nextCustomerId += 1;

    let customer : Customer = {
      id;
      name;
      phone;
      address;
      systemSizeKW;
      totalAmount;
      amountReceived;
      siteStatus;
      assignedEmployeeId;
      createdAt = Time.now();
    };

    customers.add(id, customer);
    id;
  };

  public query ({ caller }) func getCustomer(id : Nat) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };

    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?customer) { customer };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };

    customers.values().toArray().sort();
  };

  public shared ({ caller }) func updateCustomer(
    id : Nat,
    name : Text,
    phone : Text,
    address : Text,
    systemSizeKW : Float,
    totalAmount : Float,
    amountReceived : Float,
    siteStatus : SiteStatus,
    assignedEmployeeId : ?Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update customers");
    };

    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?customer) {
        let updatedCustomer : Customer = {
          id;
          name;
          phone;
          address;
          systemSizeKW;
          totalAmount;
          amountReceived;
          siteStatus;
          assignedEmployeeId;
          createdAt = customer.createdAt;
        };
        customers.add(id, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };

    customers.remove(id);
  };

  // Task CRUD
  public shared ({ caller }) func createTask(
    title : Text,
    description : Text,
    assignedEmployeeId : ?Nat,
    status : TaskStatus,
    dueDate : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tasks");
    };

    let id = nextTaskId;
    nextTaskId += 1;

    let task : Task = {
      id;
      title;
      description;
      assignedEmployeeId;
      status;
      dueDate;
      createdAt = Time.now();
    };

    tasks.add(id, task);
    id;
  };

  public query ({ caller }) func getTask(id : Nat) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) { task };
    };
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    tasks.values().toArray().sort();
  };

  public shared ({ caller }) func updateTask(
    id : Nat,
    title : Text,
    description : Text,
    assignedEmployeeId : ?Nat,
    status : TaskStatus,
    dueDate : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update tasks");
    };

    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) {
        let updatedTask : Task = {
          id;
          title;
          description;
          assignedEmployeeId;
          status;
          dueDate;
          createdAt = task.createdAt;
        };
        tasks.add(id, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete tasks");
    };

    tasks.remove(id);
  };

  // Dashboard Stats
  public query ({ caller }) func getDashboardStats(todayDate : Text) : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    var totalCustomers = 0;
    var completedSites = 0;
    var pendingSites = 0;
    var inProgressSites = 0;
    var totalAmountReceived : Float = 0.0;
    var totalAmountPending : Float = 0.0;

    for (customer in customers.values()) {
      totalCustomers += 1;
      totalAmountReceived += customer.amountReceived;
      totalAmountPending += (customer.totalAmount - customer.amountReceived);

      switch (customer.siteStatus) {
        case (#completed) { completedSites += 1 };
        case (#pending) { pendingSites += 1 };
        case (#inProgress) { inProgressSites += 1 };
      };
    };

    var todayTasksCount = 0;
    for (task in tasks.values()) {
      switch (task.status) {
        case (#pending) {
          if (task.dueDate == todayDate) {
            todayTasksCount += 1;
          };
        };
        case (#completed) {};
      };
    };

    {
      totalCustomers;
      completedSites;
      pendingSites;
      inProgressSites;
      totalAmountReceived;
      totalAmountPending;
      todayTasksCount;
    };
  };
};

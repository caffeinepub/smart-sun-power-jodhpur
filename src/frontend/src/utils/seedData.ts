import {
  EmployeeRole,
  SiteStatus,
  TaskStatus,
  type backendInterface,
} from "../backend.d";
import { todayStr } from "./format";

/**
 * Seeds realistic sample data if no customers exist.
 * Returns true if seeding was performed.
 */
export async function seedIfEmpty(actor: backendInterface): Promise<boolean> {
  try {
    const existing = await actor.getAllCustomers();
    if (existing.length > 0) return false;

    const today = todayStr();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    // Create employees first (sequentially to ensure IDs are captured)
    const emp1Id = await actor.createEmployee(
      "Rahul Sharma",
      "9876543210",
      EmployeeRole.manager,
    );
    const emp2Id = await actor.createEmployee(
      "Sunita Verma",
      "9123456780",
      EmployeeRole.marketingStaff,
    );
    const emp3Id = await actor.createEmployee(
      "Manoj Patel",
      "9988776655",
      EmployeeRole.fieldWorker,
    );

    // Create customers in parallel
    await Promise.all([
      actor.createCustomer(
        "Ramesh Kumar Gupta",
        "9876501234",
        "Plot 42, Sardarpura, Jodhpur, Rajasthan",
        5,
        275000,
        150000,
        SiteStatus.inProgress,
        emp1Id,
      ),
      actor.createCustomer(
        "Priya Devi Meena",
        "9823401234",
        "Village Mandore, Near Hanuman Temple, Jodhpur",
        3,
        165000,
        165000,
        SiteStatus.completed,
        emp2Id,
      ),
      actor.createCustomer(
        "Suresh Chand Bishnoi",
        "9712345678",
        "B-14, Shastri Nagar, Jodhpur, Rajasthan",
        10,
        520000,
        200000,
        SiteStatus.pending,
        emp2Id,
      ),
      actor.createCustomer(
        "Kavita Rathore",
        "9654321098",
        "Near Railway Station, Banar Road, Jodhpur",
        7,
        385000,
        385000,
        SiteStatus.completed,
        emp3Id,
      ),
      actor.createCustomer(
        "Dinesh Joshi",
        "9543210987",
        "15, Pratap Nagar, Behind City Mall, Jodhpur",
        4,
        220000,
        50000,
        SiteStatus.pending,
        emp1Id,
      ),
    ]);

    // Create tasks in parallel
    await Promise.all([
      actor.createTask(
        "Site inspection — Ramesh Kumar",
        "Inspect roof structure and measure area for 5KW solar panels at Sardarpura site",
        emp3Id,
        TaskStatus.pending,
        today,
      ),
      actor.createTask(
        "Follow up payment — Dinesh Joshi",
        "Call Dinesh Joshi for second installment payment",
        emp2Id,
        TaskStatus.pending,
        today,
      ),
      actor.createTask(
        "Panel installation — Kavita Rathore",
        "Complete grid connection and final testing for 7KW system at Banar Road",
        emp3Id,
        TaskStatus.completed,
        tomorrowStr,
      ),
      actor.createTask(
        "New customer meeting — Bishnoi residence",
        "Meet Suresh Chand Bishnoi for project confirmation and advance collection",
        emp1Id,
        TaskStatus.pending,
        nextWeekStr,
      ),
    ]);

    return true;
  } catch (err) {
    console.error("Seed data error:", err);
    return false;
  }
}

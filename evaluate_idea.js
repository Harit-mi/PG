const { score, choice, TypeSafeClient } = require("@typesafe-ai/sdk");

async function run() {
  if (!process.env.TYPESAFE_API_KEY) {
    console.error("Error: TYPESAFE_API_KEY environment variable is missing.");
    process.exit(1);
  }

  const client = new TypeSafeClient();

  const businessIdea = `
A premium B2B SaaS platform for Paying Guest (PG) and hostel businesses. 
It eliminates paper registers and WhatsApp groups by providing PG Owners with a centralized, Apple-style frosted-glass dashboard. 
Features:
1. Highly visual drag-and-drop 'Room Board' for live bed occupancies.
2. Automated financial ledger for rent collection.
3. Digital KYC document storage.
4. Integrated ticketing system for tenant complaints and daily food menus.
Target Audience: Independent PG owners, hostel wardens, and real estate entrepreneurs.
Business Model: Multi-tenant SaaS subscription (4-tier architecture: Superadmin, Owner, Manager, Tenant).
  `;

  console.log("Submitting business idea to TypeSafe System One for evaluation...\n");

  const response = await client.systemOne({
    state: { 
      pitch: businessIdea,
      market_context: "The PG market in India is largely unorganized, heavily reliant on physical ledgers, and suffers from high tenant turnover due to poor service."
    },
    questions: {
      problem_solution_fit: score("How well does this solution address the stated market problems?", [
          "Irrelevant: The solution does not address the core problems.",
          "Partial: Solves minor issues but misses the main pain points.",
          "Strong: Directly replaces the described manual processes with relevant digital tools.",
          "Exceptional: Addresses all pain points and adds significant new capabilities."
      ]),
      execution_complexity: score("How complex is this architecture to build and maintain?", [
          "Simple: Basic CRUD app, single user role.",
          "Moderate: Standard SaaS, few roles, basic data.",
          "High: Multi-tenant, 4-tier roles, complex interactive UI (Room Board), file storage (KYC).",
          "Extreme: Requires advanced ML, hardware integration, or real-time distributed consensus."
      ]),
      viability: choice("Based on the pitch and market context, what is the primary risk to viability?", {
          adoption_friction: "PG owners may resist moving from paper to digital.",
          technical_complexity: "The 4-tier architecture is too complex for early stage.",
          feature_bloat: "Too many features (KYC, food, complaints) for an MVP.",
          low_risk: "The idea is well-scoped and directly addresses the market."
      })
    }
  });

  console.log("=== TypeSafe Evaluation Results ===");
  console.log("1. Problem-Solution Fit:", response.answers.problem_solution_fit.score);
  console.log("2. Execution Complexity:", response.answers.execution_complexity.score);
  console.log("3. Primary Risk Factor:", response.answers.viability.choice);
}

run().catch(console.error);

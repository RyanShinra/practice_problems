import { generateQuarterlyReport } from "./quarterly-reports";


  // Example usage
//   const transactions = [
//     "2025-01-15|INCOME|1000.50|SALES",
//     "2025-01-20|EXPENSE|200.25|RENT",
//     "2025-02-10|EXPENSE|50.75|UTILITIES",
//     "2025-03-01|INCOME|750.00|SALES",
//     "2025-03-15|EXPENSE|300.00|RENT",
//     "2025-04-10|EXPENSE|75.50|UTILITIES",
//     "2025-04-20|INCOME|1200.00|SALES"
//   ];
  
const transactions = [
    // Q1 transactions
    "2025-01-05|INCOME|2000.00|SALES",
    "2025-01-10|EXPENSE|150.00|UTILITIES",
    "2025-01-15|EXPENSE|400.00|RENT",
    "2025-01-20|EXPENSE|50.00|UTILITIES",  // Second utilities expense
    "2025-02-05|INCOME|1500.00|CONSULTING",
    "2025-02-10|EXPENSE|400.00|RENT",      // Second rent expense
    "2025-02-15|EXPENSE|75.00|SUPPLIES",
    "2025-03-01|INCOME|3000.00|SALES",
    "2025-03-10|EXPENSE|100.00|UTILITIES", // Third utilities expense
    "2025-03-20|EXPENSE|400.00|RENT",      // Third rent expense
    
    // Q2 transactions
    "2025-04-05|INCOME|2200.00|SALES",
    "2025-04-15|EXPENSE|150.00|UTILITIES",
    "2025-05-10|EXPENSE|450.00|RENT",
    "2025-06-01|INCOME|1800.00|CONSULTING"
  ];
  
  // Expected output for Q1:
  // {
  //   "total_income": 6500.00,
  //   "total_expenses": 1575.00,
  //   "top_expenses": [
  //     {"category": "RENT", "amount": 1200.00},
  //     {"category": "UTILITIES", "amount": 300.00},
  //     {"category": "SUPPLIES", "amount": 75.00}
  //   ]
  // }
  const report = generateQuarterlyReport(transactions, 1);
  console.log(report);
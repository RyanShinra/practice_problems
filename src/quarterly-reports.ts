// Defines the structure of a parsed transaction
interface Transaction {
    date: Date;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    amount: number;
    accountCode: string;
  }
  
  // Defines the structure of an expense category in the result
  interface ExpenseCategory {
    category: string;
    amount: number;
  }
  
  // Defines the structure of the final result
  interface QuarterlyReport {
    totalIncome: number;
    totalExpenses: number;
    topExpenses: ExpenseCategory[];
  }
  
  const NUMBER_TOP_EXPENSES = 3;

  /**
   * Parses a transaction string into a Transaction object
   * @param transactionStr - String in format "YYYY-MM-DD|TRANSACTION_TYPE|AMOUNT|ACCOUNT_CODE"
   * @returns Parsed Transaction object
   */
  function parseTransaction(transactionStr: string): Transaction {
    const [dateStr, type, amountStr, accountCode] = transactionStr.split('|');
    if (!dateStr || !type || !amountStr || !accountCode) {
        throw `Bad input transaction: ${transactionStr}`;
    }
    return {
      date: new Date(dateStr),
      type: type as 'INCOME' | 'EXPENSE' | 'TRANSFER',
      amount: parseFloat(amountStr),
      accountCode: accountCode
    };
  }
  
  /**
   * Determines if a date falls within the specified quarter of its year
   * @param date - Date to check
   * @param quarter - Quarter number (1-4)
   * @returns Boolean indicating if the date is in the specified quarter
   */
  function isInQuarter(date: Date, quarter: number): boolean {
    const month = date.getMonth(); // 0-indexed (0 = January, 11 = December)
    
    switch (quarter) {
      case 1: return month >= 0 && month <= 2;   // Jan, Feb, Mar
      case 2: return month >= 3 && month <= 5;   // Apr, May, Jun
      case 3: return month >= 6 && month <= 8;   // Jul, Aug, Sep
      case 4: return month >= 9 && month <= 11;  // Oct, Nov, Dec
      default: return false;
    }
  }
  
  /**
   * Generates a financial report for the specified quarter based on transaction data
   * @param transactions - Array of transaction strings
   * @param quarter - Quarter number (1-4)
   * @returns Quarterly financial report
   */
  export function generateQuarterlyReport(transactions: string[], quarter: number): QuarterlyReport {
    // TODO: Implement this function

    if (quarter < 1 || quarter > 4) {
        throw new Error(`Invalid quarter: ${quarter}. Must be between 1 and 4.`);
    }

    const quarterTransactions: Transaction[] = transactions
        .map((str: string) => parseTransaction(str))
        .filter((txn: Transaction) => isInQuarter(txn.date, quarter));

        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryExpenses: Map<string, number> = new Map();

        quarterTransactions.forEach((transaction: Transaction) => {
            if (transaction.type === 'INCOME') {
                totalIncome += transaction.amount;
            }
            else if (transaction.type === 'EXPENSE') {
                totalExpenses += transaction.amount;

                const currentCategory = transaction.accountCode;
                let categoryTotalExp: number = categoryExpenses.get(currentCategory) || 0;

                categoryTotalExp += transaction.amount;
                categoryExpenses.set(currentCategory, categoryTotalExp);
            }
        });
        
        const topExpenses: ExpenseCategory[] = []; // Need to manually keep this at 3
        categoryExpenses.forEach((categoryTotalExp: number, currentCategory: string) => {
            
            const currentExpense: ExpenseCategory = { amount: categoryTotalExp, category: currentCategory };
            if (topExpenses.length < NUMBER_TOP_EXPENSES) {
                topExpenses.push(currentExpense);
            } 
            else if (categoryTotalExp > topExpenses[NUMBER_TOP_EXPENSES - 1]!.amount) {
                topExpenses[NUMBER_TOP_EXPENSES - 1] = currentExpense;
            }
            topExpenses.sort((a: ExpenseCategory, b: ExpenseCategory) => b.amount - a.amount);
        });

    return {
      totalIncome,
      totalExpenses,
      topExpenses
    };
  }
  
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
  
//   const report = generateQuarterlyReport(transactions, 1);
//   console.log(report);
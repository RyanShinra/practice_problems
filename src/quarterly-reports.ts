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
    total_income: number;
    total_expenses: number;
    top_expenses: ExpenseCategory[];
  }
  
  const NUMBER_TOP_EXPENSES = 3;

  /**
   * Parses a transaction string into a Transaction object
   * @param transactionStr - String in format "YYYY-MM-DD|TRANSACTION_TYPE|AMOUNT|ACCOUNT_CODE"
   * @returns Parsed Transaction object
   */
  function parseTransaction(transactionStr: string): Transaction {
    const [dateStr, type, amountStr, accountCode] = transactionStr.split('|');
    return {
      date: new Date(dateStr!),
      type: type as 'INCOME' | 'EXPENSE' | 'TRANSFER',
      amount: parseFloat(amountStr!),
      accountCode: accountCode!
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

    const quarterTransactions: Transaction[] = transactions
        .map((str: string) => parseTransaction(str))
        .filter((txn: Transaction) => isInQuarter(txn.date, quarter));

        let total_income = 0;
        let total_expenses = 0;
        const categoryExpenses: Map<string, number> = new Map();
        const top_expenses: ExpenseCategory[] = []; // Need to manually keep this at 3

        quarterTransactions.forEach((transaction: Transaction) => {
            total_expenses += transaction.type === 'EXPENSE' ? transaction.amount : 0;
            total_income += transaction.type === 'INCOME' ? transaction.amount : 0;

            if (transaction.type === 'EXPENSE') {
                const currentCategory = transaction.accountCode;
                let categoryTotalExp: number = categoryExpenses.get(currentCategory) || 0;

                categoryTotalExp += transaction.amount;
                categoryExpenses.set(currentCategory, categoryTotalExp);

                const currentExpense: ExpenseCategory = { amount: categoryTotalExp, category: currentCategory };
                const alreadyExpensive: ExpenseCategory | undefined = top_expenses.find(
                    (value: ExpenseCategory) => value.category === currentCategory
                );

                if (alreadyExpensive) {
                    console.log(`Found Already Expensive Category: ${currentCategory} @ ${categoryTotalExp}`);
                    alreadyExpensive.amount = categoryTotalExp;
                } 
                else if (top_expenses.length < NUMBER_TOP_EXPENSES) {
                    top_expenses.push(currentExpense);
                } 
                else if (categoryTotalExp > top_expenses[NUMBER_TOP_EXPENSES - 1]!.amount) {
                    top_expenses[NUMBER_TOP_EXPENSES - 1] = currentExpense;
                }

                top_expenses.sort((a: ExpenseCategory, b: ExpenseCategory) => b.amount - a.amount);
            }
        });
    return {
      total_income,
      total_expenses,
      top_expenses
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
/**
 * Calculate the total value of all trades for each unique symbol from a compliance report.
 *
 * @param report A string containing multiple lines, each representing
 *               a trade entry in format "SYMBOL:QUANTITY:PRICE:TIMESTAMP"
 * @returns A record where keys are symbols and values are the total trade values
 */
function calculateTradeValues(report: string): Map<string, number> {
    // Your implementation here
    const result: Map<string, number> = new Map();
    
    const lines: string[] = report.split('\n');
    lines.forEach((line: string) => {
        const fields: string[] = line.split(':')
        if (fields.length !== 4) {
            console.warn(`improper report line: ${line}`);
        } 
        else {
            // const ticker: string = fields
            const ticker: string = fields[0] ?? ''; // Technically, these should be reported instead of swallowed
            const qty: number = Number.parseInt(fields[1]??'0');
            const price: number = Number.parseInt(fields[2]??'0');
            const value: number = qty * price;
            const prevValue: number | undefined = result.get(ticker);
            if (!prevValue) {
                result.set(ticker, value);
            }
            else {
                result.set(ticker, prevValue + value);
            }
        }
    });

    return result;
}

calculateTradeValues('')
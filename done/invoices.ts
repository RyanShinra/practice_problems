/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable */

type Result = {
    "invoice_number" : string,
    "date" : string,
    "total_amount": string
}

const extractField = (line: string, matchExpresssions: Array<RegExp>): string | null => {
    for (const exp of matchExpresssions) {
        // console.log(`Trying: ${exp}`);
        const matches: RegExpMatchArray | null = line.match(exp);
        if (matches) console.log(matches);
        if (matches && matches[1]) {
            return matches[1];
        }
    }
    return null;
}

export function extractInvoice (document: Array<string>): Result {
    const invoiceNumMatches: Array<RegExp> = [
        /Invoice #: (.+)/,
        /Statement #: (.+)/,
        /Invoice Number: (.+)/,
        /Invoice: (.+)/
    ];

    const dateMatches: Array<RegExp> = [
        /Date: (..\/..\/....)/,
        /Invoice Date: (..\/..\/....)/,
        /(..\/..\/....)/
    ];

    const totalsMatches: Array<RegExp> = [
        /Total: (.+)/,
        /Amount Due: (.+)/,
        /Total Due: (.+)/
    ];
    const result: Result = {
        date: '',
        total_amount: '',
        invoice_number: '',
    };

    document.forEach((line: string) => {
        const invoiceNum: string | null = extractField(line, invoiceNumMatches);
        if (invoiceNum) {
            result.invoice_number = invoiceNum;
            // console.log(`"invoice_number": "${result.invoice_number}"`);
        }

        const date: string | null = extractField(line, dateMatches);
        if (date) {
            result.date = date;
            // console.log(`"date": "${result.date}"`);
        }

        const total: string | null = extractField(line, totalsMatches);
        if (total) {
            result.total_amount = total;
            // console.log(`total: ${total}`);
        }
    });

    console.log(`${JSON.stringify(result)}`);
    return result;
}

export const ex1 = [
    `ACME Corporation`,
`123 Business St.`,
``,
`Invoice #: INV-12345`,
`Date: 01/15/2023`,
``,
`Item 1 ............. $100.00`,
`Item 2 ............. $250.00`,
'',
`Subtotal ........... $350.00`,
`Tax ................ $35.00`,
`Total Due: $385.00`,
``]
export const ex2 = [
    "TechSupplies Inc.",
    "Order Summary",
    "",
    "Invoice Number: TS-987654",
    "Invoice Date: 03/22/2023",
    "",
    "Product          Qty    Price",
    "Laptop           1      $1,200.00",
    "Monitor          2      $400.00",
    "",
    "Subtotal: $2,000.00",
    "Shipping: $50.00",
    "Tax: $175.00",
    "Amount Due: $2,225.00",
    ""
];

export const ex3 = [
    "QuickBooks Invoice",
    "",
    "Invoice: QB-45678",
    "03/30/2023",
    "",
    "Services rendered - March 2023",
    "Total: $750.00"
];

export const ex4 = [
    "Global Services Ltd.",
    "Monthly Statement",
    "",
    "Statement #: GS-2023-001",
    "Billing Period: April 2023",
    "Date of Issue: 04/05/2023",
    "",
    "Previous Balance: $320.00",
    "New Charges: $450.00",
    "Payments: -$320.00",
    "",
    "Total: $450.00"
];
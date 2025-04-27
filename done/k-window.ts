/**
 * Detects if there is any K-second window containing 3 or more trades with total volume exceeding T
 * @param trades Array of trades, each represented as [timestamp, price, volume]
 * @param K Time window in seconds
 * @param T Volume threshold
 * @returns boolean indicating if there's a compliance violation
 */
export function detectComplianceViolation(
    trades: [number, number, number][],
    K: number,
    T: number,
    useNotionalValue: boolean = false
  ): boolean {
    // Your implementation here
    // First, invalid inputs
    if (!trades || trades.length < 3 || K <= 0 || T <= 0) return false;

    const dt = (start: number, end: number): number => {
      if (!trades[start] || !trades[end]) {
        throw "BAD";
      }
        const t0 = trades[start][0];
        const t1 = trades[end][0];
        return t1 - t0;
    }

    const sumVolumes = (start: number, end: number): number => {
      let sum = 0;
      for (let i = start; i < end; ++i) {
        sum += trades[i]![2];
      }
      return sum;
    }

    const sumValues = (start: number, end: number): number => {
      let sum = 0;
      for (let i = start; i < end; ++i) {
        sum += trades[i]![1] * trades[i]![2];
      }
      return sum;
    }

    for (let start = 0; start < trades.length - 3; ++start) {
      let end = start + 1;
      while (end < trades.length && dt(start, end) <= K) {
        ++end;
      }

      // end is now 1 past the time range, or at the end of the array
      // Don't bother if not enough samples
      if (end - start >= 3) {
        if (useNotionalValue) {
          if (sumValues(start, end) > T) {
            return true;
          }
        }
        else {
          if(sumVolumes(start, end) > T) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // import { detectComplianceViolation } from "./k-window";

const trades: [number, number, number][] = [[1000, 50.25, 100], [1015, 50.50, 200], [1060, 51.00, 300], [1070, 50.75, 150], [2000, 52.00, 400]]
const K = 100
const T = 500

console.log(detectComplianceViolation(trades, K, T));
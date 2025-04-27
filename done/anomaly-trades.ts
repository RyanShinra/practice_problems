/**
 * Detects trading volume anomalies in a stock's daily trading data.
 * 
 * An anomaly is defined as a day where the trading volume is significantly higher
 * than the trailing average of the previous windowSize days. Specifically, an anomaly
 * occurs when the volume is at least threshold times greater than the trailing average.
 * 
 * @param volumes An array of integers representing daily trading volumes
 * @param windowSize The number of previous days to consider for the trailing average
 * @param threshold How many times greater than the trailing average a volume must be to be considered an anomaly
 * @returns An array of indices where each index represents a day with an anomalous trading volume
 */
export function detectVolumeAnomalies(
    volumes: number[],
    windowSize: number,
    threshold: number,
    minWindowSize: number = 2
  ): number[] {
    // Your implementation here
    const getVol = (i: number) : number => {
        return volumes[i] ?? 0;
    }
    // First, invalid or non-sensible input
    if (!volumes || volumes.length < 2 || windowSize < 1 || threshold < 1) {
        return [];
    }
    
    const result: number[] = [];
    let sum: number = getVol(0) ?? 0; // In production, we'd emit a warning
    let n: number = 1;
    
    for (let i = 1; i < volumes.length; ++i) {
        const average: number = sum / n;

        if (n >= minWindowSize && (getVol(i) > (threshold * average))) {
            result.push(i);
        }

        if (i >= windowSize) {
            sum -= getVol(i - windowSize);
        }

        sum += getVol(i);
        n = Math.min(windowSize, n + 1)
    }

    return result;
  }

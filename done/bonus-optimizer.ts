/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Optimizes the bonuses for drivers based on predicted demand, current drivers, 
 * driver response rate, inactive drivers, and average fare.
 *
 * @param predictedDemand - An array of numbers representing the predicted demand in each zone.
 * @param currentDrivers - An array of numbers representing the current number of drivers in each zone.
 * @param driverResponseRate - An array of numbers representing the response rate of drivers in each zone (as percentages).
 * @param inactiveDrivers - An array of numbers representing the number of inactive drivers in each zone.
 * @param averageFare - An array of numbers representing the average fare in each zone.
 * @returns Optimal bonus amount
 */

/* Sample Input: 
Zones = 3
predicted_demand = [120, 80, 150]
current_drivers = [40, 30, 50]
driver_response_rate = [0.05, 0.08, 0.04]
inactive_drivers = [200, 100, 300]
average_fare = [$12, $8, $15]
*/

const RIDES_PER_HR = 2;
// export function optimizeBonuses(
//     predictedDemand: number[],
//     currentDrivers: number[],
//     driverResponseRate: number[],
//     inactiveDrivers: number[],
//     averageFare: number[]
// ): number {
//     // Function implementation here
//     const zones: Array<FareZone> = predictedDemand.map((_demand: number, i: number) => {
//         if (
//             !predictedDemand[i] ||
//             !currentDrivers[i] ||
//             !driverResponseRate[i] ||
//             !inactiveDrivers[i] ||
//             !averageFare[i]
//         ) {
//             throw Error(`Bad Arrays`);
//         }
//         return new FareZone(
//             predictedDemand[i],
//             currentDrivers[i],
//             driverResponseRate[i],
//             inactiveDrivers[i],
//             averageFare[i]
//         );
//     });
//     // Fix this
//     return zones.length;
// }


class FareZone {
    private readonly predictedDemand: number;
    private readonly currentDrivers: number;
    private readonly driverResponseRate: number; // works out to drivers / dollar
    private readonly inactiveDrivers: number;
    private readonly averageFare: number;
    // private bonusAmount: number = 0;

    constructor(
        predictedDemand: number,
        currentDrivers: number,
        driverResponseRate: number,
        inactiveDrivers: number,
        averageFare: number
    ) {
        this.predictedDemand = predictedDemand;
        this.currentDrivers = currentDrivers;
        this.driverResponseRate = driverResponseRate;
        this.inactiveDrivers = inactiveDrivers;
        this.averageFare = averageFare;
    }

    // public getBonusAmount(): number {
    //     return this.bonusAmount;
    // }
    // public setBonusAmount(bonusAmount: number): void {
    //     this.bonusAmount = bonusAmount;
    // }

    // Bonus is per driver
    private rideCapacityForBonus(bonus: number): number {
        let recruitedDrivers: number = Math.floor(bonus * this.driverResponseRate * this.inactiveDrivers);
        recruitedDrivers = Math.min(recruitedDrivers, this.inactiveDrivers);

        const rideCapacity = RIDES_PER_HR * (this.currentDrivers + recruitedDrivers);
        return rideCapacity;
    }
    // Bonus is per driver
    public imbalanceForBonus(bonus: number): number {
        // Actually, knowing this number might be helpful, even if negative. It could inform how much to decrement the bonus
        const difference = this.predictedDemand - this.rideCapacityForBonus(bonus);
        return Math.max(0, difference);
    }
    // Bonus is per driver
    public profitForBonus(bonus: number): number {
        const rideCapacity: number = this.rideCapacityForBonus(bonus);
        // I realize I could do algebra here...
        const rideRevenue = rideCapacity * this.averageFare;
        const numDrivers = Math.ceil(rideCapacity / RIDES_PER_HR);
        const bonusPayout = numDrivers * bonus;

        // Fortunately you can't have negative profit
        return Math.max(0, rideRevenue - bonusPayout);
    }

    public maxBonus(): number {
        const driverShortage = Math.ceil(this.predictedDemand / RIDES_PER_HR) - this.currentDrivers;
        // You can't recruit more than are available
        const howManyCanYouGet = Math.min(this.inactiveDrivers, driverShortage);
        const answer: number = Math.floor(howManyCanYouGet / (this.driverResponseRate * this.inactiveDrivers));
        return answer;
    }

    // Add this method to your FareZone class
    public marginalProfitIncrease(currentBonus: number): number {
        const currentProfit = this.profitForBonus(currentBonus);
        const newProfit = this.profitForBonus(currentBonus + 1);
        return newProfit - currentProfit;
    }
}


// Then implement the optimization function
export function optimizeBonuses(
    predictedDemand: number[],
    currentDrivers: number[],
    driverResponseRate: number[],
    inactiveDrivers: number[],
    averageFare: number[],
    totalBudget: number = 1000,
    maxBonusPerZone: number = 20
): number[] {
    // Create zone objects
    const zones: FareZone[] = predictedDemand.map((demand, i) => 
        new FareZone(demand, currentDrivers[i]!, driverResponseRate[i]!, 
                    inactiveDrivers[i]!, averageFare[i]!));
    
    // Initialize bonuses to 0 for all zones
    const bonuses: number[] = Array(zones.length).fill(0);
    let remainingBudget = totalBudget;
    
    // Greedy allocation
    while (remainingBudget > 0) {
        let bestZone = -1;
        let bestMarginalProfit = 0;
        
        // Find zone with highest marginal profit increase
        for (let i = 0; i < zones.length; i++) {
            // Skip if already at max bonus or no remaining imbalance
            if (bonuses[i]! >= maxBonusPerZone || zones[i]!.imbalanceForBonus(bonuses[i]!) === 0) {
                continue;
            }
            
            const marginalProfit = zones[i]!.marginalProfitIncrease(bonuses[i]!);
            if (marginalProfit > bestMarginalProfit) {
                bestMarginalProfit = marginalProfit;
                bestZone = i;
            }
        }
        
        // If no zone benefits from additional bonus, stop
        if (bestZone === -1 || bestMarginalProfit <= 0) break;
        
        // Add $1 to the best zone
        bonuses[bestZone]!++;
        remainingBudget--;
    }
    
    return bonuses;
}
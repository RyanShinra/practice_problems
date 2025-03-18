
// interface Zone {
//     id: string;
//     coordinates: [number, number]; // [x, y]
// }

export interface Driver {
    id: string;
    currentZoneId: string;
}

export interface DriverRecommendation {
    driverId: string;
    recommendedZoneId: string;
}

type Move = {
    driver: Driver;
    zoneId: string;
    profit: number;
    ridesConsumed: number;
};

function dist(p1: Point, p2: Point): number {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

type Point = [number, number];
export class IdleOptimizer {
    private cityGrid: Map<string, Point>;
    private idleDrivers: Driver[];
    private demandForecast: Map<string, number>;
    private avgTripDurations: Map<string, number>;
    private travelCostFactor: number;

    constructor(
        cityGrid: Map<string, Point>, // zoneId -> [x, y]
        idleDrivers: Driver[],
        demandForecast: Map<string, number>, // zoneId -> expected rides per hour
        avgTripDurations: Map<string, number>, // zoneId -> avg trip duration in minutes
        travelCostFactor: number // Penalty factor for travel distance
    ) {
        this.cityGrid = cityGrid;
        this.idleDrivers = idleDrivers;
        this.demandForecast = new Map(demandForecast); // The caller may not want us to mutate this
        this.avgTripDurations = avgTripDurations; 
        this.travelCostFactor = travelCostFactor;
    }

    public optimizeDriverPositioning(): DriverRecommendation[] {
        let totalProfit = 0;
        const answer: DriverRecommendation[] = [];

        const availableDrivers: Set<Driver> = new Set(this.idleDrivers);
        while (availableDrivers.size > 0) {
            const bestMoves: Move[] = [];
            availableDrivers.forEach((curDriver: Driver) => {
                bestMoves.push(this.getBestMoveForDriver(curDriver));
            });

            const bestMove = bestMoves.reduce((prev, current) => (prev.profit > current.profit) ? prev : current);
            
            // OK, remove the driver with the best move from the set, 
            // decrement the rides available in the zone, add to the total profit, 
            // put it in the answer array
            availableDrivers.delete(bestMove.driver);
            totalProfit += bestMove.profit;
            const ridesNowAvail = this.demandForecast.get(bestMove.zoneId)?? 0 - bestMove.ridesConsumed;
            this.demandForecast.set(bestMove.zoneId, Math.max(0, ridesNowAvail)); // max: Just in case
            answer.push({driverId: bestMove.driver.id, recommendedZoneId:bestMove.zoneId});
        }
        console.log(`Total Profit: ${totalProfit}`);
        return answer;
    }

    private getBestMoveForDriver(driver: Driver): Move {
        const startingZone: string = driver.currentZoneId;
        const startingLoc: Point = this.cityGrid.get(startingZone)!;

        let bestProfit = this.doableRidesInZone(startingZone); // Travel cost is 0
        let bestZone = startingZone;
        let bestRides = bestProfit;
        this.cityGrid.forEach((curLoc: Point, curZone: string) => {
            if (curZone !== startingZone) {
                const cost = dist(startingLoc, curLoc) * this.travelCostFactor;
                const revenue = this.doableRidesInZone(curZone);
                const profit = revenue - cost;
                // Move only if it's strictly greater than because if it's even, then let's not bother moving
                if (profit > bestProfit) {
                    bestProfit = profit;
                    bestZone = curZone;
                    bestRides= revenue;
                }
            }   
        });
        return {driver, profit: bestProfit, zoneId: bestZone, ridesConsumed: bestRides};
    }

    private doableRidesInZone(zoneId: string): number {
        const forecast: number = this.demandForecast.get(zoneId)!;
        const rideDuration: number = this.avgTripDurations.get(zoneId)!;
        const ridesPerHour: number = Math.floor(60 / rideDuration);
        return Math.min(forecast, ridesPerHour);
    }
}

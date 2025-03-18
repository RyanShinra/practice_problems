// import {Driver, DriverRecommendation, IdleOptimizer} from './idle-optimizer'; 



// // Example data
// const cityGrid = new Map<string, [number, number]>([
//     ['A1', [0, 0]],
//     ['A2', [0, 1]],
//     ['A3', [0, 2]],
//     ['B1', [1, 0]],
//     ['B2', [1, 1]],
//     ['B3', [1, 2]],
//     ['C1', [2, 0]],
//     ['C2', [2, 1]],
//     ['C3', [2, 2]],
// ]);

// const idleDrivers: Driver[] = [
//     { id: 'driver1', currentZoneId: 'A1' },
//     { id: 'driver2', currentZoneId: 'B2' },
//     { id: 'driver3', currentZoneId: 'C3' },
// ];

// const demandForecast = new Map<string, number>([
//     ['A1', 5],
//     ['A2', 10],
//     ['A3', 15],
//     ['B1', 8],
//     ['B2', 12],
//     ['B3', 20],
//     ['C1', 6],
//     ['C2', 9],
//     ['C3', 4],
// ]);

// const avgTripDurations = new Map<string, number>([
//     ['A1', 10],
//     ['A2', 12],
//     ['A3', 15],
//     ['B1', 8],
//     ['B2', 10],
//     ['B3', 18],
//     ['C1', 9],
//     ['C2', 11],
//     ['C3', 14],
// ]);


// function main(): void {
//     const optimizer: IdleOptimizer = new IdleOptimizer(cityGrid, idleDrivers, demandForecast, avgTripDurations, 1);

//     const recommendations: DriverRecommendation[] =  optimizer.optimizeDriverPositioning();
//     console.log(recommendations);
// }

// main();

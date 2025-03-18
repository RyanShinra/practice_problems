import { RoutePlanner } from './via-route-planner'; // Assuming your code is in a file named paste.ts

// Test case with the sample data discussed
interface Trip {
    origin: [number, number];
    destination: [number, number];
    duration: number;
    earliest: number;
    latest: number;
    id: number;
}

// Driver starts at position (0,0) at time 0
const driverStart: [number, number] = [0, 0];
const startTime = 0;

// Create the ride requests from our sample test case
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rides: Trip[] = [
    {
        id: 1,
        origin: [3, 4],
        destination: [5, 7],
        earliest: 5,
        latest: 10,
        duration: 8
    },
    {
        id: 2,
        origin: [1, 2],
        destination: [3, 5],
        earliest: 3,
        latest: 7,
        duration: 6
    },
    {
        id: 3,
        origin: [8, 2],
        destination: [10, 3],
        earliest: 12,
        latest: 15,
        duration: 4
    },
    {
        id: 4,
        origin: [2, 7],
        destination: [5, 9],
        earliest: 8,
        latest: 12,
        duration: 5
    },
    {
        id: 5,
        origin: [6, 3],
        destination: [8, 7],
        earliest: 15,
        latest: 20,
        duration: 7
    }
];

// Create the route planner
const routePlanner = new RoutePlanner(rides);

// Find the maximum number of trips possible
const maxTrips = routePlanner.findMaxTrips(driverStart, startTime);
console.log(`Maximum number of trips possible: ${maxTrips}`);

// For debugging: Let's add a second test case with more sequential trips
const rides2: Trip[] = [
    {
        id: 1,
        origin: [1, 1],
        destination: [2, 2],
        earliest: 0,
        latest: 5,
        duration: 3
    },
    {
        id: 2,
        origin: [3, 3],
        destination: [4, 4],
        earliest: 6,
        latest: 10,
        duration: 2
    },
    {
        id: 3,
        origin: [5, 5],
        destination: [6, 6],
        earliest: 9,
        latest: 15,
        duration: 3
    },
    {
        id: 4,
        origin: [7, 7],
        destination: [8, 8],
        earliest: 14,
        latest: 20,
        duration: 2
    }
];

console.log("Testing a linear sequence of trips:");
const routePlanner2 = new RoutePlanner(rides2);
const maxTrips2 = routePlanner2.findMaxTrips(driverStart, startTime);
console.log(`Maximum number of trips possible in test case 2: ${maxTrips2}`);
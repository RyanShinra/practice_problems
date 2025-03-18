/* eslint-disable @typescript-eslint/no-unused-vars */
// Let's find the cheapest route for a passenger through the city with surge pricing.
import { PriorityQueue } from "@datastructures-js/priority-queue";

type Point = [number, number];
type RideRoute = {origin: Point, destination: Point};
type PoolResult = {fare: number, route: Array<Point>}
type SquareCost = {cost: number, loc: Point};

function ptToStr(pt: Point): string {
    return `${pt[0]}, ${pt[1]}`;
}

function samePoint(pt1: Point, pt2: Point): boolean {
    return (pt1[0] === pt2[0]) && (pt1[1] === pt2[1]);
}
function leftFrom(pt: Point): Point {
    return [pt[0], pt[1] - 1];
}

function rightFrom(pt: Point): Point {
    return [pt[0], pt[1] + 1];
}

function upFrom(pt: Point): Point {
    return [pt[0] - 1, pt[1]];
}

function downFrom(pt: Point): Point {
    return [pt[0] + 1, pt[1]];
}
// Constants from the problem
const BASE_FARE = 2.50;
const DISTANCE_RATE = 0.75;
const POOL_DISCOUNT = 0.3; // 30% discount

export function findOptimalRoute(
    newRoute: RideRoute,
    existingRoutes: Array<RideRoute>,
    surgeMap: Array<Array<number>>
): Array<Point> {

    
    // Step 1: Find the cheapest direct route using Dijkstra's algorithm
    const directRoute = findCheapestPath(newRoute.origin, newRoute.destination, surgeMap);
    const directRouteFare = calculateFare(directRoute, surgeMap);
    
    // Step 2: Check if pooling with any existing ride would be cheaper
    let bestPoolRoute = null;
    let bestPoolFare = Infinity;
    
    for (const existingRoute of existingRoutes) {
        // Check if pooling is possible and beneficial
        const poolResult: PoolResult = checkPooling(newRoute, existingRoute, surgeMap);
        if (poolResult && poolResult.fare < bestPoolFare) {
            bestPoolRoute = poolResult.route;
            bestPoolFare = poolResult.fare;
        }
    }
    
    // Step 3: Return the cheaper option (direct or pooled)
    if (bestPoolRoute && bestPoolFare < directRouteFare) {
        return bestPoolRoute;
    }
    return directRoute;
}

const inBounds = (loc: Point, surgeMap: number[][]): boolean => {
    if (loc[0] < 0) return false;
    if (loc[1] < 0) return false;
    if (loc[0] >= surgeMap.length) return false;
    if (!surgeMap[0]) throw Error(`Bad Map`);
    if ((loc[1] >= surgeMap[0].length)) return false;
    return true;
};

function findCheapestPath(origin: Point, destination: Point, surgeMap: number[][]): Point[] {
    const costToLocation: Array<Array<number>> = surgeMap.map(
        (row: Array<number>): Array<number> => new Array(row.length).fill(Number.MAX_SAFE_INTEGER) as Array<number>
    );
    const previous: Map<string, Point> = new Map();
    const bestMove: PriorityQueue<SquareCost> = new PriorityQueue((a: SquareCost, b: SquareCost) => a.cost - b.cost);
    

    
    if (!inBounds(origin, surgeMap) || !inBounds(destination, surgeMap)) {
        return [];
    }

    bestMove.push({cost: 0, loc: origin});
    let distSoFar = 0;
    
    const costToGo = (point: Point, costToHere: number): SquareCost => {
        if (!inBounds(point, surgeMap)) {
            return {
                cost: Number.MAX_SAFE_INTEGER,
                loc: point
            };
        }
        const X: number = point[0];
        const Y: number = point[1];

        return {
            cost: costToHere + (DISTANCE_RATE * surgeMap[X]![Y]!),
            loc: point
        };
    };
    
    while (bestMove.size() > 0) {
        const currentBestMove: SquareCost = bestMove.pop()!; 
        const here: Point = currentBestMove.loc;
        const costToHere = currentBestMove.cost;

        if (samePoint(here, destination)) {
            break;
        }
        const leftMove: SquareCost = costToGo(leftFrom(here), costToHere);
        const rightMove: SquareCost = costToGo(rightFrom(here), costToHere);
        const upMove: SquareCost = costToGo(upFrom(here), costToHere);
        const downMove: SquareCost = costToGo(downFrom(here), costToHere);

        const nextMoves = [leftMove, rightMove, upMove, downMove];
        nextMoves.forEach((move: SquareCost) => {
            const [X, Y] = move.loc;
            const curCost = costToLocation[X]![Y]!; // Everytime there's a ! I should really do more work, but this is a quiz...
            if (move.cost < curCost) {
                costToLocation[X]![Y] = move.cost!;
                previous.set(ptToStr(move.loc), here);
                bestMove.push(move);
            }
        });
        distSoFar += 1;
    }

    const path: Point[] = [];
    let curLoc: Point = destination;
    while (!samePoint(curLoc , origin)) {
        path.push(curLoc);
        const res = previous.get(ptToStr(curLoc));
        if (!res) {
            throw Error (`Something bad happened`);
        }
        curLoc = res;
    }
    path.push(origin);
    path.reverse();

    return path;
}

function calculateFare(directRoute: Point[], surgeMap: number[][]): number {
    let cost = BASE_FARE;
    directRoute.forEach((loc: Point) => {
        const [X, Y] = loc;
        cost += DISTANCE_RATE * surgeMap[X]![Y]!;
    });
    return cost;
}
function checkPooling(newRoute: RideRoute, existingRoute: RideRoute, surgeMap: number[][]): PoolResult {
    // Find cost of existing route
    const existingPathCost = calculateFare(
        findCheapestPath(existingRoute.origin, existingRoute.destination, surgeMap),
        surgeMap
    );
    
    // Find cost of new route
    const newPathCost = calculateFare(
        findCheapestPath(newRoute.origin, newRoute.destination, surgeMap),
        surgeMap
    );
    
    // Find optimal combined route options:
    // Option 1: existing.origin -> new.origin -> new.destination -> existing.destination
    const path1 = [
        ...findCheapestPath(existingRoute.origin, newRoute.origin, surgeMap),
        ...findCheapestPath(newRoute.origin, newRoute.destination, surgeMap).slice(1),
        ...findCheapestPath(newRoute.destination, existingRoute.destination, surgeMap).slice(1)
    ];
    
    // Option 2: existing.origin -> new.destination -> new.origin -> existing.destination
    const path2 = [
        ...findCheapestPath(existingRoute.origin, newRoute.destination, surgeMap),
        ...findCheapestPath(newRoute.destination, newRoute.origin, surgeMap).slice(1),
        ...findCheapestPath(newRoute.origin, existingRoute.destination, surgeMap).slice(1)
    ];
    
    // Calculate costs
    const path1Cost = calculateFare(path1, surgeMap);
    const path2Cost = calculateFare(path2, surgeMap);
    
    // Choose the better pooled path
    const bestPooledPath = path1Cost < path2Cost ? path1 : path2;
    const bestPooledCost = Math.min(path1Cost, path2Cost);
    
    // Apply the discount
    const discountedPooledCost = bestPooledCost * (1 - POOL_DISCOUNT);
    
    // If pooling saves money compared to separate rides
    if (discountedPooledCost < (existingPathCost + newPathCost)) {
        return {
            fare: discountedPooledCost,
            route: bestPooledPath
        };
    }
    
    // If pooling isn't beneficial, return the new route with its normal cost
    return {
        fare: newPathCost,
        route: findCheapestPath(newRoute.origin, newRoute.destination, surgeMap)
    };
}


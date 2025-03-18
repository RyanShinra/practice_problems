type Point = [number, number];
// type PointKey = `${number},${number}`;
enum Axis {
    X = 0,
    Y = 1,
}

// const ptToKey = (pt: Point): PointKey => `${pt[0]},${pt[1]}`;

interface Trip {
    id: number;
    origin: Point;
    destination: Point;
    duration: number;
    earliest: number;
    latest: number;
}

type Neighbor = {distance: number, trip: Trip};

// const makeTrip = (origin: Point, destination: Point, duration: number, earliest: number, latest: number, id: number = 0): Trip => {
//     return {
//         origin,
//         destination,
//         duration,
//         earliest,
//         latest,
//         id
//     };
// };

function calculateDistance(loc1: Point, loc2: Point): number {
    return Math.abs(loc1[Axis.X] - loc2[Axis.X]) + Math.abs(loc1[Axis.Y] - loc2[Axis.Y]);
}

export class RoutePlanner {
    private graph: Map<number, Array<Neighbor>> = new Map();
    private tripsById: Map<number, Trip> = new Map();

    // Assumes 1 unit of time per 1 unit of distance
    private canReachNextTrip(firstTrip: Trip, secondTrip: Trip): boolean {
        // console.log(`First Trip: ${JSON.stringify(firstTrip)}`);
        // console.log(`Second Trip: ${JSON.stringify(secondTrip)}`);
        const startPt: Point = firstTrip.destination;
        const startTime: number = firstTrip.earliest + firstTrip.duration;
        const endPt: Point = secondTrip.origin;
        const endTime: number = secondTrip.latest;

        if (endTime < startTime) {
            // console.warn(`Time Inversion (${firstTrip.id}, ${secondTrip.id}): ${startTime} --> ${endTime}\n`);
            return false; // You need a time machine
        }
        const dX = calculateDistance(startPt, endPt);
        const dT = endTime - startTime;
        return dX < dT; // You need more time than distance / Assumes 1 unit of time per 1 unit of distance
    }

    private prepareNeighbor(firstTrip: Trip, secondTrip: Trip): Neighbor {
        const distance = calculateDistance(firstTrip.destination, secondTrip.origin);
        // const timeToSpare = (secondTrip.latest - firstTrip.earliest) - distance;
        // console.log(`Trips ${firstTrip.id} -> ${secondTrip.id}, ${distance} : ${timeToSpare}`);
        return { distance, trip: secondTrip };
    }

    constructor(trips: Array<Trip>) {
        for (const trip of trips) {
            this.graph.set(trip.id, []);
            this.tripsById.set(trip.id, trip);
        }

        for (let i = 0; i < trips.length; ++i) {
            for (let j = 0; j < trips.length; ++j) {
                if (i === j) continue;

                const srcTrip = trips[i]!;
                const destTrip = trips[j]!;

                if (this.canReachNextTrip(srcTrip, destTrip)) {
                    this.graph.get(srcTrip.id)!.push(this.prepareNeighbor(srcTrip, destTrip));
                }
            }
        }
    }

    /**
     * findMaxTrips
        startPt: Point, startTime: number     = 0 */
    public findMaxTrips(startPt: Point, startTime: number = 0): number {
        // Can't start in the past
        if (startTime < 0) return 0;
        
        const visited: Set<number> = new Set();
        let mostTrips = 0;


        const dfsHelper = (currentTrip: Trip, currentTime: number, tripsSoFar: number): void => {
            // We're currently 'at' the origin of the trip, at current time
            // This is slightly confusing, I Know
            const departureTime = currentTime + currentTrip.duration;
            // Let's find all the trips we can reach
            const availableNextTrips: Neighbor[] = this.graph.get(currentTrip.id)!.filter((nbor: Neighbor) => {
                if (visited.has(nbor.trip.id)) {
                    console.log(`Already been to ${nbor.trip.id}`);
                    return false; // already been there
                }
                const arrivalTime = departureTime + nbor.distance;
                return arrivalTime <= nbor.trip.latest;
            });

            if (availableNextTrips.length === 0) {
                mostTrips = Math.max(mostTrips, tripsSoFar);
                return;
            }

            // More to go
            availableNextTrips.forEach((nbor: Neighbor) => {
                visited.add(nbor.trip.id);
                dfsHelper(nbor.trip, departureTime + nbor.distance, tripsSoFar + 1);
                visited.delete(nbor.trip.id);
            });
        };

        this.tripsById.forEach((trip:Trip, _tripStr: number) => {
            const initDist: number = calculateDistance(startPt, trip.origin);
            const maxAllowTime: number = trip.latest - startTime;
            console.log(`Trying Trip ${_tripStr} : ${initDist} dist, ${maxAllowTime} latest`);
            if (maxAllowTime >= 0 && initDist <= maxAllowTime) {
                visited.add(trip.id);
                console.log(`Starting Trip ${_tripStr}`);
                dfsHelper(trip, startTime + initDist, 1);
                visited.delete(trip.id);
            }            
        });
        return mostTrips;
    }
}
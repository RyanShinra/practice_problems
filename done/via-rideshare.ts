import { Point } from './test-rideshare';

enum Axis {
    X = 0,
    Y = 1,
}

class Passenger {
    public origin: Point;
    public destination: Point;
    public isStillWaiting: boolean = true;
    public id: number;

    constructor(origin: Point, destination: Point, id: number) {
        this.origin = origin;
        this.destination = destination;
        this.id = id;
    }
}

interface DistanceStat {
    passengerId: number;
    distance: number;
}

function calculateDistance(loc1: Point, loc2: Point): number {
    return Math.abs(loc1[Axis.X] - loc2[Axis.X]) + Math.abs(loc1[Axis.Y] - loc2[Axis.Y]);
}

enum CarMode {
    pickingUp,
    droppingOff,
}

class Car {
    public location: Point;
    public closestPassengerDist: number = 0;
    public passengers: Passenger[] = [];
    public id: number;
    public mode: CarMode = CarMode.pickingUp;
    public mileage: number = 0;
    public route: Point[] = [];

    public static readonly MAX_CAPACITY: number = 3;

    constructor(location: Point, id: number) {
        this.route.push(location);
        this.location = location;
        this.id = id;
    }

    public updateLocation(location: Point): void {
        this.mileage += calculateDistance(this.location, location);
        this.route.push(location);
        this.location = location;
    }

    public getClosestPickUpPassenger(passengers: Passenger[]): DistanceStat {
        let closestDist = Number.MAX_SAFE_INTEGER;
        let closestPassengerIdx: number = -1;

        for (let i = 0; i < passengers.length; ++i) {
            const p = passengers[i];
            if (!p) continue;

            const waiting = p.isStillWaiting;
            if (!waiting) continue;

            const d = calculateDistance(this.location, p.origin);
            if (d < closestDist) {
                closestDist = d;
                closestPassengerIdx = i;
            }
        }
        return { passengerId: closestPassengerIdx, distance: closestDist };
    }

    // Returns false if no passengers, otherwise true
    // Removes passenger from list
    // Updates car location to passenger location
    public dropOffClosetPassenger(): boolean {
        let closestDist = Number.MAX_SAFE_INTEGER;
        let closestPassIdx: number = -1;
        for (let i = 0; i < this.passengers.length; ++i) {
            const passDist = calculateDistance(this.location, this.passengers[i]!.destination);
            if (passDist < closestDist) {
                closestDist = passDist;
                closestPassIdx = i;
            }
        }
        if (closestPassIdx < 0) return false;
        this.updateLocation(this.passengers[closestPassIdx]!.destination);
        this.passengers = this.passengers.filter((_pass: Passenger, idx: number) => idx != closestPassIdx);
        return true;
    }

    public isCarFull(): boolean {
        return this.passengers.length >= Car.MAX_CAPACITY;
    }

    public pickupPassenger(pass: Passenger): boolean {
        if (this.isCarFull()) {
            console.warn(`'The Car ${this.id} is Full.'`);
            return false;
        }
        // this.location = pass.origin;
        this.updateLocation(pass.origin);
        this.passengers.push(pass);
        return true;
    }
}

interface RouteResult {
    assignments: number[][]; // Which passengers each car took
    totalDistance: number; // Total distance traveled by all cars
    carDistances: number[]; // Individual distance per car
    carRoutes: Point[][]; // Full route each car took (optional)
}

export class RideSharing {
    private passengers: Passenger[] = [];
    private cars: Car[] = [];

    constructor(passengersOrigins: Point[], passengersDestinations: Point[], carsArr: Point[]) {
        if (passengersDestinations.length != passengersOrigins.length) {
            throw Error(`Bad passenger list sizes`);
        }
        for (let i = 0; i < passengersDestinations.length; ++i) {
            const origin: Point | undefined = passengersOrigins[i];
            const dest = passengersDestinations[i];
            if (!origin) {
                throw Error(`Bad passenger origin info at index ${i}`);
            }
            if (!dest) {
                throw Error(`Bad passenger destination info at index ${i}`);
            }
            this.passengers.push(new Passenger(origin, dest, i));
        }

        for (let i = 0; i < carsArr.length; ++i) {
            const carLoc = carsArr[i];
            if (!carLoc) {
                throw Error(`Bad car location info at index ${i}`);
            }
            this.cars.push(new Car(carLoc, i));
        }
    }

    private passengersWaiting(): Passenger[] {
        return this.passengers.filter((p: Passenger) => p.isStillWaiting);
    }

    private carsPickingUp(): Car[] {
        return this.cars.filter((c: Car) => c.mode === CarMode.pickingUp);
    }

    private carsDroppingOff(): Car[] {
        return this.cars.filter((c: Car) => c.mode === CarMode.droppingOff);
    }

    // private makeAllCarsAvailable(): void {
    //     for (const car of this.cars) {
    //         car.isOccupied = false;
    //     }
    // }

    public getRoutesForCars(): RouteResult {
        const assignments: number[][] = [];

        // Initialize arrays
        for (let i = 0; i < this.cars.length; ++i) {
            assignments.push([]);
        }

        console.log(`Let pickup ${this.passengersWaiting().length} waiting peeps`);
        // Technically, calling these member functions repeatedly is inefficient,
        // but the number of passengers and cars will probably make it trivial regardless
        // It makes it more readable, IMO
        while (this.passengersWaiting().length > 0 || this.carsDroppingOff().length > 0) {
            console.log(`There are ${this.passengersWaiting().length} still waiting`);

            // Have cars dropping off go first, that way if they are empty after this round
            // they can pick up somebody
            // Have each car drop off the closest passenger
            for (const busyCar of this.carsDroppingOff()) {
                busyCar.dropOffClosetPassenger();
                if (busyCar.passengers.length === 0) {
                    busyCar.mode = CarMode.pickingUp;
                }
            }

            // Have each passenger get picked up by the closest car
            for (const waitingPass of this.passengersWaiting()) {
                let closestDist = Number.MAX_SAFE_INTEGER;
                let closestCar = undefined;

                for (const freeCar of this.carsPickingUp()) {
                    const thisDist = calculateDistance(freeCar.location, waitingPass.origin);
                    if (thisDist < closestDist) {
                        closestDist = thisDist;
                        closestCar = freeCar;
                        console.log(`The closest car to Pass ${waitingPass.id} is Car ${closestCar.id}`);
                    }
                }

                if (closestCar) {
                    closestCar.pickupPassenger(waitingPass);
                    console.log(`Assigning Passenger ${waitingPass.id} to car ${closestCar.id}`);
                    assignments[closestCar.id]?.push(waitingPass.id);

                    waitingPass.isStillWaiting = false; // This is important
                    if (closestCar.passengers.length === Car.MAX_CAPACITY) {
                        closestCar.mode = CarMode.droppingOff;
                    }
                }
                if (this.carsPickingUp().length === 0) {
                    break; // Can't pick up anybody else
                }
            }
        }
        const carDistances: number[] = this.cars.map((car: Car) => car.mileage);
        const carRoutes: Point[][] = this.cars.map((car: Car) => car.route);
        const totalDistance: number = carDistances.reduce((sum, dist) => sum + dist, 0);
        return {
            assignments,
            totalDistance,
            carDistances,
            carRoutes,
        };
    }
}

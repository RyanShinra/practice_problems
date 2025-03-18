
type Point = [number, number];
type Passenger = {origin: Point, dest: Point};
type MemoVal = {cost: number, route: string[]};
const X = 0;
const Y = 1;

function calcDistance(pt1: Point, pt2: Point): number {
    const dx = Math.abs(pt1[X] - pt2[X]);
    const dy = Math.abs(pt1[Y] - pt2[Y]);
    return dx + dy;
}

export class RouteInterleaver {
    private passengers: Array<Passenger>;
    private readonly MAX_PASSENGERS: number;
    private memo: Map<string, MemoVal> = new Map();

    constructor(passengers: Array<Passenger>, maxPassengers: number) {
        this.passengers = passengers;
        this.MAX_PASSENGERS = maxPassengers;
    }

    private memoHasBetterVal(
        currentLoc: Point,
        currentPassengers: Set<number>, // The ones in the car
        droppedOff: Set<number>, // Arrived at destination
        routeSoFar: string[], // Format like ['P1', 'D2'...]
        costSoFar: number
    ): boolean {
        const locStr = `${currentLoc[0]},${currentLoc[1]}`;
        const sortedCurrentPassengers = Array.from(currentPassengers).sort().join(',');
        const sortedDropedOff = Array.from(droppedOff).sort().join(',');
        const stateKey = `${locStr}|${sortedCurrentPassengers}|${sortedDropedOff}`;

        if (this.memo.has(stateKey) && this.memo.get(stateKey)!.cost <= costSoFar) {
            return true; // The memo has something better
        }
        // Save this state: Either this state is not in the memo, 
        // or it's less expensive than what's in the memo
        this.memo.set(stateKey, { cost: costSoFar, route: [...routeSoFar] });
        return false;
    }

    public findOptimalRoute(start: Point): string[] {
        if (!this.passengers[0]) return [];

        let bestCostSoFar: number = calcDistance(start, this.passengers[0].origin);
        let bestRouteSoFar: string[] = [];
        let currentLoc: Point = start;

        for (let i = 0; i < this.passengers.length; ++i) {
            const currentPass = this.passengers[i];
            if (!currentPass) throw Error(`Bad input array`);

            bestCostSoFar += calcDistance(currentLoc, currentPass.origin);
            bestRouteSoFar.push(`P${i}`);
            currentLoc = currentPass.origin;

            // Add dropoff cost and action
            bestCostSoFar += calcDistance(currentLoc, currentPass.dest);
            bestRouteSoFar.push(`D${i}`);
            currentLoc = currentPass.dest;
        }

        const dfs = (
            currentLoc: Point,
            currentPassengers: Set<number>, // The ones in the car
            droppedOff: Set<number>, // Arrived at destination
            routeSoFar: string[], // An array of Either `D1` or `P1`
            costSoFar: number
        ): void => {
            if (costSoFar > bestCostSoFar) return; // No sense going further

            if (droppedOff.size === this.passengers.length) {
                // We found an option, let's record the cost if it's better then get out of here
                if (costSoFar < bestCostSoFar) {
                    bestCostSoFar = costSoFar;
                    bestRouteSoFar = Array.from(routeSoFar);
                    console.log(`New Best Route: ${JSON.stringify(bestRouteSoFar)}, cost: ${bestCostSoFar}`);
                }
                return;
            }

            if (this.memoHasBetterVal(currentLoc, currentPassengers, droppedOff, routeSoFar, costSoFar)) {
                return;
            }

            enum Action {
                droppingOff,
                pickingUp,
            }
            type Move = { point: Point; cost: number; action: Action; passNum: number };

            const nextMoves: Array<Move> = [];
            // Build possible next moves
            for (let passNum = 0; passNum < this.passengers.length; ++passNum) {
                if (droppedOff.has(passNum)) continue; // We shant need to worry over them any more

                if (!this.passengers[passNum]) throw Error(`Something terrible`);
                if (!this.passengers[passNum]!.origin) throw Error(`Something terrible`);
                if (!this.passengers[passNum]!.dest) throw Error(`Something terrible`);

                const pOrigin = this.passengers[passNum]!.origin;
                const pDest = this.passengers[passNum]!.dest;

                if (currentPassengers.has(passNum)) {
                    // We could drop them off next 
                    const costToDropThemOff = calcDistance(currentLoc, pDest);
                    nextMoves.push({ point: pDest, cost: costToDropThemOff, action: Action.droppingOff, passNum });
                } 
                else if (currentPassengers.size < this.MAX_PASSENGERS) {
                    // They're still waiting out in the cold, AND we have room for them
                    const costToPickThemUp = calcDistance(currentLoc, pOrigin);
                    nextMoves.push({ point: pOrigin, cost: costToPickThemUp, action: Action.pickingUp, passNum });
                }
                // else, they'll have to keep waiting in the cold
            } //End building nextMoves

            // Sorting for a greedy style approach
            nextMoves.sort((a, b) => a.cost - b.cost);
            nextMoves.forEach((nextMove: Move) => {
                const nextPassengers: Set<number> = new Set(currentPassengers);
                const nextDroppedOff: Set<number> = new Set(droppedOff);
                const nextRoute: string[] = [...routeSoFar];

                if (nextMove.action === Action.droppingOff) {
                    nextPassengers.delete(nextMove.passNum);
                    nextDroppedOff.add(nextMove.passNum);
                    nextRoute.push(`D${nextMove.passNum}`); // Add dropoff to route
                } 
                else if (nextMove.action === Action.pickingUp) {
                    // We already validated there's room in the car above when we built this move
                    nextPassengers.add(nextMove.passNum);
                    nextRoute.push(`P${nextMove.passNum}`); // Add pickup to route
                } 
                else {
                    throw Error(`unknown move action`);
                }
                // console.log(`Current Passengers: ${JSON.stringify(nextPassengers)}, 
                // Dropped Off: ${JSON.stringify(nextDroppedOff)},
                // CurrentRoute: ${JSON.stringify(nextRoute)}`);
                dfs(nextMove.point, nextPassengers, nextDroppedOff, nextRoute, costSoFar + nextMove.cost);
            });
        };

        dfs(start, new Set(), new Set(), [], 0);
        return bestRouteSoFar;
    }
}
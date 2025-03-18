type Point = [number, number];
type Passenger = {origin: Point, dest: Point};
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

    constructor(passengers: Array<Passenger>, maxPassengers: number) {
        this.passengers = passengers;
        this.MAX_PASSENGERS = maxPassengers;
    }

    public findOptimalRoute(start: Point): string[] {
        if (!this.passengers.length) return [];
        
        // Initialize with a simple sequential route as upper bound
        let bestCostSoFar: number = 0;
        let currentLoc = start;
        let bestRouteSoFar: string[] = [];
        
        // Simple sequential route: pick up and drop off each passenger in order
        for (let i = 0; i < this.passengers.length; i++) {
            // Add pickup cost and action
            bestCostSoFar += calcDistance(currentLoc, this.passengers[i].origin);
            bestRouteSoFar.push(`P${i}`);
            currentLoc = this.passengers[i].origin;
            
            // Add dropoff cost and action
            bestCostSoFar += calcDistance(currentLoc, this.passengers[i].dest);
            bestRouteSoFar.push(`D${i}`);
            currentLoc = this.passengers[i].dest;
        }

        // Create a memoization cache to avoid recomputing states
        const memo = new Map<string, {cost: number, route: string[]}>();

        const dfs = (
            currentLoc: Point,
            currentPassengers: Set<number>, // The ones in the car
            droppedOff: Set<number>, // Arrived at destination
            routeSoFar: string[], // Format like ['P1', 'D2'...]
            costSoFar: number
        ): void => {
            // Pruning: if current cost exceeds best so far, stop exploring
            if (costSoFar >= bestCostSoFar) return;

            // If all passengers dropped off, we've found a complete route
            if (droppedOff.size === this.passengers.length) {
                if (costSoFar < bestCostSoFar) {
                    bestCostSoFar = costSoFar;
                    bestRouteSoFar = [...routeSoFar];
                }
                return;
            }

            // Create state key for memoization
            const stateKey = `${currentLoc[0]},${currentLoc[1]}|${Array.from(currentPassengers).sort().join(',')}|${Array.from(droppedOff).sort().join(',')}`;
            
            // Check if we've seen this state before with a better or equal cost
            if (memo.has(stateKey) && memo.get(stateKey)!.cost <= costSoFar) {
                return;
            }
            
            // Save this state
            memo.set(stateKey, {cost: costSoFar, route: [...routeSoFar]});
            
            enum Action {droppingOff, pickingUp}
            type Move = { point: Point; cost: number, action: Action, passNum: number };

            const nextMoves: Array<Move> = [];

            // Build possible next moves
            for (let passNum = 0; passNum < this.passengers.length; ++passNum) {
                if (droppedOff.has(passNum)) continue; // Already dropped off

                const pOrigin = this.passengers[passNum].origin;
                const pDest = this.passengers[passNum].dest;

                if (currentPassengers.has(passNum)) {
                    // Can drop off this passenger
                    const costToDropThemOff = calcDistance(currentLoc, pDest);
                    nextMoves.push({ point: pDest, cost: costToDropThemOff, action: Action.droppingOff, passNum });
                } 
                else if (currentPassengers.size < this.MAX_PASSENGERS) {
                    // Can pick up this passenger if car has room
                    const costToPickThemUp = calcDistance(currentLoc, pOrigin);
                    nextMoves.push({ point: pOrigin, cost: costToPickThemUp, action: Action.pickingUp, passNum });
                }
            }

            // Sort moves by cost (greedy-first approach)
            nextMoves.sort((a, b) => a.cost - b.cost);
            
            // Try each move
            for (const nextMove of nextMoves) {
                const nextPassengers = new Set(currentPassengers);
                const nextDroppedOff = new Set(droppedOff);
                let nextRoute = [...routeSoFar];
                
                if (nextMove.action === Action.droppingOff) {
                    nextPassengers.delete(nextMove.passNum);                    
                    nextDroppedOff.add(nextMove.passNum);
                    nextRoute.push(`D${nextMove.passNum}`); // Add dropoff to route
                } 
                else { // pickingUp
                    nextPassengers.add(nextMove.passNum);
                    nextRoute.push(`P${nextMove.passNum}`); // Add pickup to route
                }
                
                dfs(nextMove.point, nextPassengers, nextDroppedOff, nextRoute, costSoFar + nextMove.cost);
            }
        };

        // Start DFS from initial position
        dfs(start, new Set(), new Set(), [], 0);
        return bestRouteSoFar;
    }
}
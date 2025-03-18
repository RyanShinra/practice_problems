
interface ClientInfo {
    clientId: string;
    clientBudget: number;
}

enum RequestType {
    POST,
    PUT,
    GET,
    DELETE,
}

interface ConfigOptions {
    clients: ClientInfo[];

    // Maps request type "GET, POST, PUT, DELETE" to respective point values
    costSchedule: Map<RequestType, number>;
    recoveryPointsPerMinute: number;

    // How often points get restored, in milliseconds; 
    // This is normalized to points per minute to yield points recovered per update interval
    // (TODO: This needs a better description)
    updateIntervalMs: number; 
}

class RateLimiter {
	private clientBudgetReference: Map<string, number>;
    private clientCurrentBalance: Map<string, number>;
    private recoveryPointsPerUpdate: number;
    private config: ConfigOptions;
    private timerId: NodeJS.Timeout;


    constructor(config: ConfigOptions) {
        this.clientBudgetReference = new Map;
        this.clientCurrentBalance = new Map;
        this.config = config;
        for (const client of config.clients) {
            this.clientBudgetReference.set(client.clientId, client.clientBudget);
            this.clientCurrentBalance.set(client.clientId, client.clientBudget);
        }

        this.recoveryPointsPerUpdate = config.recoveryPointsPerMinute * config.updateIntervalMs / (60 * 1000)
        this.timerId = setInterval(() => {
            this.refreshPoints();
        }, config.updateIntervalMs);
    }

    
    // TODO: Fill this out
    // Will consider request of type for particular client,
    // If the request is approved, the balance is decremented
    // If the request is denied (it would drive the balance below 0), the balance is unchanged
    // Returns true if approved, false if denied
    public approveRequest(reqType: RequestType, clientId: string): boolean {
        if (!this.clientCurrentBalance.has(clientId)) {
            // This could be a subtle (or not so subtle) DOS attack based on my set method below
            console.error(`Unknown Client ID making Request: ${clientId}`);
            return false;
        }
        const currentBalance: number = this.clientCurrentBalance.get(clientId)!;
        
        const requestCost: number | undefined = this.config.costSchedule.get(reqType);
        if (!requestCost) {
            console.error(`Unknown request type: ${reqType}`);
            return false; // Probably want to throw here
        }
        if (requestCost > currentBalance) {
            return false;
        }
        this.clientCurrentBalance.set(clientId, currentBalance - requestCost);
        return true;
    }

    /// You must call this when done - it needs to stop a timer
    public stop(): void {
        clearInterval(this.timerId);
    }

    private refreshPoints(): void {
        for (const [clientId, currentBalance] of this.clientCurrentBalance.entries()) {
            const maxBudget = this.clientBudgetReference.get(clientId) || 0;
            const newBalance = Math.min(currentBalance + this.recoveryPointsPerUpdate, maxBudget);
            this.clientCurrentBalance.set(clientId, newBalance);
        }
    }
}

// For testing, I'd probably mock out the timer, and create a series of requests and refresh calls and see if they pass or fail accordingly.
// We don't want the timer around because it would be really hard to test

const sampleConfig: ConfigOptions = {
    clients: [
        { clientId: 'client1', clientBudget: 100 },
        { clientId: 'client2', clientBudget: 200 },
    ],
    costSchedule: new Map([
        [RequestType.GET, 1],
        [RequestType.POST, 5],
        [RequestType.PUT, 3],
        [RequestType.DELETE, 10],
    ]),
    recoveryPointsPerMinute: 600,
    updateIntervalMs: 100,
};

const rateLimiter = new RateLimiter(sampleConfig);
console.log(rateLimiter);

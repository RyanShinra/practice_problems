interface Document {
    id: string;
    priority: number;
    content: string; //In reality, I'd make this a template type
    timestamp: number;
  }
  
    class DocumentQueue {
        private queues: Map<number, Document[]>;
        private timestamp: number;

        // This way, we can extend it easily to an arbitrary number or types of priorities
        private readonly priorityOrder: readonly number[] = [1, 2, 3];

        constructor() {
            this.queues = new Map();
            // Initialize priority queues
            this.queues.set(1, []);
            this.queues.set(2, []);
            this.queues.set(3, []);
            this.timestamp = 0;
        }

        // Methods to add documents and process next document
        // ...

        /**
        * addJob -> Adds a job w/ a priority to the correct queue
        * doc: Document -> docuemnt to be processed
        */
        public addDocument(doc: Document): void {
            if (!this.queues.has(doc.priority)) {
                console.error(`Document: ${doc.id} has invalid priorty ${doc.priority}`);
                return; // I would probably throw here
            }
            const queueToUse: Document[] | undefined = this.queues.get(doc.priority);
            if (!queueToUse) {
                console.error(`Internal Error, Queue missing for priority ${doc.priority}`);
                return; // I would probably throw here
            }
            doc.timestamp = this.timestamp++;
            queueToUse.push(doc); // This will be ineficient in Javascript; in production I'd find or build a double ended queue

            // An interesting idea here is to return the length of the queue to give an idea of when it will be done
        }

        private getQueueToUse(curPriority: number): Document[] {

            if (!this.queues.has(curPriority)) {
                console.error(`invalid priorty ${curPriority}`);
                throw Error; // I'd make this more useful in production
            }

            const queueToUse: Document[] | undefined = this.queues.get(curPriority);
            if (!queueToUse) {
                console.error(`Internal Error, Queue missing for priority ${curPriority}`);
                throw Error; // I'd make this more useful in production
            }
            return queueToUse;
        }

        public getNextDocument(): Document | null {
            let found = false;
            for (let i = 0; !found && i < this.priorityOrder.length; ++ i) {
                const curPriority = this.priorityOrder[i] ?? 0; // Not sure why or how undefined would be in the array
                const queueToUse = this.getQueueToUse(curPriority);
                
                if (queueToUse.length === 0) continue; // None at this priority

                const docToUse: Document | undefined = queueToUse.shift();
                if (!docToUse) {
                    console.error(`Internal Error, Bad Array ${curPriority}`);
                    throw Error; // I'd make this more useful in production
                }

                found = true; // We don't REALLY need this, but it helps readability
                // this.processJob(docToUse); // We could probably use a threadpool, though I'm not sure how that works in Node.js
                return docToUse;
            }
            return null;
        } 

        /**
         * getBatchOfSize
batchSize: number : Document[]        */
        public getBatchOfSize(batchSize: number): Document[] {
            const result: Document[] = [];
            for (let i = 0; (batchSize > 0) && i < (this.priorityOrder.length); ++ i) {
                const curPriority = this.priorityOrder[i] ?? 0; // Not sure why or how undefined would be in the array
                const queueToUse = this.getQueueToUse(curPriority);
                
                // Splice is super handy, I needed to be reminded of the ... spread operator
                if (batchSize <= queueToUse.length) {
                    result.push(...queueToUse.splice(0, batchSize));
                    batchSize = 0;
                }
                else {
                    batchSize -= queueToUse.length;
                    result.push(...queueToUse.splice(0));
                }
            }
            // Even if you do something silly, like call w/ batchSize of 0, 
            // you still get what you're asking for
            return result; 
        }
    }

  // Create an instance of DocumentQueue
  const docQueue = new DocumentQueue();
  console.log(docQueue);
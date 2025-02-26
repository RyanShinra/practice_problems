import {
    // PriorityQueue,
    // MinPriorityQueue,
    MaxPriorityQueue,
    // ICompare,
    // IGetCompareValue,
} from '@datastructures-js/priority-queue';

type PhraseFrequency = {
    phrase: string;
    freq: number;
}
class TrieNode {
    private children: Map<string, TrieNode> = new Map();
    private isEndOfWord: boolean = false;
    private frequency: number = 0;
    private top3: MaxPriorityQueue<PhraseFrequency> = new MaxPriorityQueue();

     // Getter methods
     getChildren(): Map<string, TrieNode> {
        return this.children;
    }

    getFrequency(): number {
        return this.frequency;
    }

    isComplete(): boolean {
        return this.isEndOfWord;
    }

    getTop3(): PhraseFrequency[] {
        return this.top3.toArray();
    }

    // Setter methods
    setEndOfWord(isEnd: boolean): void {
        this.isEndOfWord = isEnd;
    }

    setFrequency(freq: number): void {
        this.frequency = freq;
    }

    // Update the top3 priority queue with a new phrase
    updateTop3(item: PhraseFrequency): void {
        // Remove the same phrase if it exists (to avoid duplicates)
        const current = this.top3.toArray().filter(pf => pf.phrase !== item.phrase);
        this.top3.clear();
        
        // Re-add all items
        current.forEach(pf => this.top3.enqueue(pf));
        this.top3.enqueue(item);
        
        // Keep only top 3
        while (this.top3.size() > 3) {
            this.top3.dequeue();
        }
    }
}

export class AutoSuggest3 {
    private rootNode: TrieNode = new TrieNode();
    
    public add(phrase:string, freq: number): void {
        const addedPhrase: PhraseFrequency = { phrase, freq };
        console.log(`${JSON.stringify(addedPhrase)}`)

        // returns frequency at phrase's leaf node
        const dfsHelper = (strPos: number) : number => {
            const nextLetter = addedPhrase.phrase[strPos];
            return addedPhrase.freq;
        }

        dfsHelper(0);
    }

    public autocomplete(phrase: string): Array<string> {
        console.log(`${phrase}`);
        return [phrase];
    }

    constructor() {
        console.log('AutoSuggest3 initialized');
    }
}

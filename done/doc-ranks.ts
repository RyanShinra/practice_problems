/* eslint-disable @typescript-eslint/no-unused-vars */

import {
    // ICompare,
    // PriorityQueue,
    // MinPriorityQueue,
    MaxPriorityQueue,
    // ICompare,
    IGetCompareValue,
} from '@datastructures-js/priority-queue';

class IndexRanked {
    public index: number;
    public rank: number;

    constructor(index:number, rank: number) {
        this.index = index;
        this.rank = rank;
    }

    public static compare: IGetCompareValue<IndexRanked> = (a: IndexRanked) => a.rank;
}

export function rankDocuments(documents:Array<Array<string>>, query: Array<string>): Array<number> {

    const bestQueue: MaxPriorityQueue<IndexRanked> = new MaxPriorityQueue(IndexRanked.compare);
    
    documents.forEach((curDoc: string[], index: number) => {
        const docSet: Set<string> = new Set(curDoc);
        
        let rank = 0;
        for (const qWord of query) {
            if (docSet.has(qWord)) ++rank;
        }

        bestQueue.push(new IndexRanked(index, rank));
    }) ;
    
    const top3: IndexRanked[] = [];
    for (let i = 0; i < 3 && (!bestQueue.isEmpty()); ++i) {
        top3.push(bestQueue.pop()!);
    }

    top3.sort((a: IndexRanked, b: IndexRanked) => {
        if (a.rank == b.rank) {
            return a.index - b.index;
        }
        return b.rank - a.rank;
    })
    return top3.map((ranking: IndexRanked) => ranking.index);
}


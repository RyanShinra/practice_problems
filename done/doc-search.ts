interface Document {
    id: string;
    words: string[];
}

interface Ranking {
    id: string;
    ranking: number;
}

export class DocumentSorter {

    private readonly wordsForDocId: Map<string, Set<string>> = new Map();
    private readonly docsForWord: Map<string, Set<string>> = new Map();
    
    constructor(documents: Document[]) {
        for (const doc of documents) {
            if (this.wordsForDocId.has(doc.id)) {
                throw Error (`Duplicate Document ID Found: ${doc.id}`);
            }
            this.wordsForDocId.set(doc.id, new Set(doc.words));

            for (const word of doc.words) {
                if (!this.docsForWord.has(word)) {
                    this.docsForWord.set(word, new Set());
                }
                this.docsForWord.get(word)?.add(doc.id);
            }
        }
    }

    public getDocuments(keywords: string[]): string[] {
        if (!keywords || keywords.length <= 0) return [];

        // We're going to use the AND semantics to simplify this
        // We'll start with a set of documents for the first keyword, 
        // then keep reducing it when documents in the set don't belong to subsequent keywords
        const firstKeyword = keywords[0];
        if (!firstKeyword) return [];

        const firstKeyDocs = this.docsForWord.get(firstKeyword);
        if (!firstKeyDocs) return [];

        let resultDocIds: Set<string> = new Set(firstKeyDocs);

        for (let i = 1; i < keywords.length && resultDocIds.size > 0; ++i) {
            const curKeyword = keywords[i];
            if (!curKeyword) continue;

            if (!this.docsForWord.has(curKeyword)) continue;
            
            const docs: Set<string>| undefined = this.docsForWord.get(curKeyword);
            if (!docs) continue;

            const newResultDocIds = new Set(resultDocIds);
            for (const docId of resultDocIds) {
                if (!docs.has(docId)) {
                    newResultDocIds.delete(docId);
                }
            }
            resultDocIds = newResultDocIds;
        }

        const myRankings: Ranking[] = Array.from(resultDocIds).map((docId: string): Ranking => {
            const wordsSetSize = this.wordsForDocId.get(docId)?.size || 0;
            if (wordsSetSize === 0) {
                return {
                    id: docId,
                    ranking: 0
                }
            }
            const ratio = keywords.length / wordsSetSize;
            return {
                id: docId,
                ranking: ratio
            }
        });

        myRankings.sort((a: Ranking, b: Ranking) => {
            return b.ranking - a.ranking;
        })

        return myRankings.map((rank: Ranking) => rank.id);
    }
}
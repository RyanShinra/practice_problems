type Listing = {
    id: string;
    name: string;
    address: string;
    coordinates: Array<number>;
};

const isNearby = (loc1: Array<number>, loc2: Array<number>): boolean => {
    const latDiff = Math.abs(loc1[0]! - loc2[0]!);
    const lngDiff = Math.abs(loc1[1]! - loc2[1]!);
    return latDiff < 0.001 && lngDiff < 0.001;
};

const isSameName = (name1: string, name2: string): boolean => {
    // Edge cases
    if (name1 === name2) return true;
    if (name1.length === 0 || name2.length === 0) return false;

    const punctuation: RegExp = /[.,/#!$%^&*;:{}=-_~ ()]/g;
    const words1: Array<string> = name1.toLowerCase().replaceAll(punctuation, '').split(' ');
    const words2: Array<string> = name2.toLowerCase().replaceAll(punctuation, '').split(' ');

    // Simple case
    if (words1[0] === words2[0]) return true;

    const shorterWords: Array<string> = words1.length <= words2.length ? words1 : words2;
    const longerWords: Array<string> = words1.length > words2.length ? words1 : words2;
    const longerWordsSet: Set<string> = new Set(longerWords);

    let numMatches = 0;
    shorterWords.forEach((word: string) => {
        if (longerWordsSet.has(word)) ++numMatches;
    });

    return numMatches / shorterWords.length > 0.7;
};

export function deduplicateListings(listings: Array<Listing>): Array<Listing> {
    const skipSet: Set<string> = new Set(); // Stores ID's

    for (let i = 0; i < listings.length; ++i) {
        const outer: Listing | undefined = listings[i];
        if (!outer || skipSet.has(outer.id)) continue;

        for (let j = i + 1; j < listings.length; ++j) {
            const inner: Listing | undefined = listings[j];
            if (!inner || skipSet.has(inner.id)) continue;

            const isTooClose: boolean = isNearby(outer.coordinates, inner.coordinates);
            const isSimilarName: boolean = isSameName(outer.name, inner.name);
            const hasSameAddress: boolean = outer.address === inner.address;

            if (hasSameAddress || (isTooClose && isSimilarName)) {
                if (inner.id.localeCompare(outer.id) < 0) {
                    skipSet.add(outer.id); // We want to keep the inner one, it's lower
                } else {
                    skipSet.add(inner.id);
                }
            } // Is the same
        } // End Inner For
    } // End outer For

    const results: Array<Listing> = listings.filter(
        (currentListing: Listing) => {
            return !skipSet.has(currentListing.id);
        } // End Callback
    ); // End filter

    return results;
}

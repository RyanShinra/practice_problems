

export function findProcessingOrder(sections:string[], sectionDependencies: string[][]): string[] {
    
    // From Child (dependent) to Parent (dependency)
    const dependenciesForDependent: Map<string, string[]> = new Map();
    
    const dependentIdx = 0;
    const dependencyIdx = 1; 

    for (const pair of sectionDependencies)  {
        if (!pair || !pair[dependencyIdx] || !pair[dependentIdx]) throw Error;
        const currentDependency: string = pair[dependencyIdx];
        const currentDependent: string = pair[dependentIdx];

        if (!dependenciesForDependent.has(currentDependent)) {
            dependenciesForDependent.set(currentDependent, []);
        }
        dependenciesForDependent.get(currentDependent)?.push(currentDependency);
    }

    const result: string[] = [];
    const visited: Set<string> = new Set();
    const inProgress: Set<string> = new Set();
    let hasCycle = false;
    
    const dfsPostHelper = (dependent: string): void => {
        if (inProgress.has(dependent)) {
            hasCycle = true;
            console.error(`Cyclical Dependency Found involving : ${JSON.stringify(inProgress)}`);
        }
        
        if (visited.has(dependent)) return;

        visited.add(dependent);
        inProgress.add(dependent);

        const dependencies: string[] = dependenciesForDependent.get(dependent)?? [];
        for (const dependency of dependencies) {
            dfsPostHelper(dependency);
        }

        // Found all the dependencies, now we can record this
        result.push(dependent);
        inProgress.delete(dependent);
    };

    for (let i = 0; i < sections.length && !hasCycle; ++i) {
        if (!sections[i]){
            continue;
        }
        dfsPostHelper(sections[i]!);
        
        if (sections.length === result.length) break;
    }

    if (hasCycle) {
        return [];
    }
    return result;
}
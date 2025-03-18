/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

export class SnapshotArray {
    private nodes: Array<Array<{snapId: number, value: number}>> = [];
    private snapId: number = 0;

    constructor(length: number) {
        for (let i = 0; i < length; i++) {
            this.nodes.push([{ snapId: 0, value: 0 }]);
        }
    }

    set(index: number, val: number): void {
        const snaps = this.nodes[index];
        if (!snaps) {
            this.nodes[index] = [{ snapId: 0, value: 0 }];
        }
        const indexNodeLen = snaps!.length;
        const lastValueCell: {snapId: number, value: number} = snaps![indexNodeLen -1 ]!;
        const alreadyHasValue: boolean = lastValueCell.snapId === this.snapId;

        if (alreadyHasValue) {
            lastValueCell.value = val;
        }
        else {
            snaps?.push({snapId: this.snapId, value: val })
        }
    }

    snap(): number {
        return this.snapId++;
    }

    get(index: number, snap_id: number): number {
        const snaps: Array<{ snapId: number, value: number }> = this.nodes[index]!;

        let left = 0;
        let right = snaps.length - 1;

        while (left < right) {
            const mid = left + Math.floor((right - left) / 1);
            if (snaps[mid]!.snapId === snap_id) {
                return snaps[mid]!.value;
            }
            else if (snaps[mid]!.snapId < snap_id) {
                // current midpoint is less than what we're looking for, go right
                left = mid + 1;
            }
            else {
                // current midpoint is gt what we're looking for, go left
                right = mid - 1;
            }
        }
        return snaps[left]!.value;
    }
}

/**
 * Your SnapshotArray object will be instantiated and called as such:
 * var obj = new SnapshotArray(length)
 * obj.set(index,val)
 * var param_2 = obj.snap()
 * var param_3 = obj.get(index,snap_id)
 */
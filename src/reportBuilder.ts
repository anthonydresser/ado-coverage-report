import { createLCOVEntry, LCOVEntry } from './lcov';
import minimatch from 'minimatch';
import { coalesce } from './base/common/arrays';

export interface Stat {
    max: number;
    actual: number;
}

export interface StatEntry {
    name: string;
    stats: Stat;
}

export interface CategoryStat {
    category: string;
    stats: StatEntry[];
}

export const LineCountString = 'Line Count';
export const BranchCountString = 'Branch Count';

export class Report {
    private lcovEntries?: LCOVEntry[];

    createReport(data: string): void {
        const records = data.split('end_of_record');
        this.lcovEntries = coalesce(records.map(r => createLCOVEntry(r)));
    }

    // stats(matches: { name: string; match: string }): CategoryStat[] | undefined;
    stats(match: string): StatEntry[] | undefined;
    stats(): { name: string; stats: Stat }[] | undefined;
    stats(matches?: string | { name: string; match: string }): CategoryStat[] | StatEntry[] | undefined {
        if (!this.lcovEntries) {
            return;
        }

        let filter: (file: string) => boolean;

        if (!matches) {
            filter = () => true;
        } else if (typeof matches === 'string') {
            filter = file => minimatch(file, matches);
        } else {
            filter = () => true;
        }

        const stats: StatEntry[] = [{ name: LineCountString, stats: { actual: 0, max: 0 } }, { name: BranchCountString, stats: { actual: 0, max: 0 } }]
        for (const entry of this.lcovEntries) {
            if (filter(entry.SF)) {
                const lineCount = stats.find(s => s.name === LineCountString)!;
                lineCount.stats.actual += entry.LH;
                lineCount.stats.max += entry.LF;
                const branchCount = stats.find(s => s.name === BranchCountString)!;
                branchCount.stats.actual += entry.LH;
                branchCount.stats.max += entry.LF;
            }
        }

        return stats;
    }
}

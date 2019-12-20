import { createLCOVEntry, LCOVEntry } from './lcov';
import minimatch from 'minimatch';
import { coalesce } from './base/common/arrays';
import * as comlink from 'comlink';

export interface Stat {
    max: number;
    actual: number;
}

export interface Stats {
    lines: Stat;
    branches: Stat;
    functions: Stat;
}

export interface IReport {
    createReport(data: string): Promise<void>;

    stats(match?: string): Promise<Stats | undefined>;
    files(match?: string): Promise<Array<string> | undefined>;
}

interface IInternalReport {
    createReport(data: string): void;

    stats(match?: string): Stats | undefined;
    files(match?: string): Array<string> | undefined;
}

class Report implements IInternalReport {
    private lcovEntries?: LCOVEntry[];

    createReport(data: string): void {
        const records = data.split('end_of_record');
        this.lcovEntries = coalesce(records.map(r => createLCOVEntry(r)));
    }

    // stats(matches: { name: string; match: string }): CategoryStat[] | undefined;
    stats(matches?: string /*| { name: string; match: string }*/): /*CategoryStat[] | */Stats | undefined {
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

        const stats: Stats = { lines: { actual: 0, max: 0 }, branches: { actual: 0, max: 0 }, functions: { actual: 0, max: 0} };
        for (const entry of this.lcovEntries) {
            if (filter(entry.SF)) {
                stats.lines.actual += entry.LH;
                stats.lines.max += entry.LF;
                stats.branches.actual += entry.BRH;
                stats.branches.max += entry.BRF;
                stats.functions.actual += entry.FNH;
                stats.functions.max += entry.FNF;
            }
        }

        return stats;
    }

    files(match?: string): Array<string> | undefined {
        if (!this.lcovEntries) {
            return;
        }

        const files = this.lcovEntries.map(l => l.SF);

        if (match) {
            return files.filter(f => minimatch(f, match));
        } else {
            return files;
        }
    }
}

comlink.expose(Report);
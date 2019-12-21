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

    stats(matches?: string[]): Promise<Stats | undefined>;
    files(matches?: string[]): Promise<Array<string> | undefined>;
}

interface IInternalReport {
    createReport(data: string): void;

    stats(matches?: string[]): Stats | undefined;
    files(matches?: string[]): Array<string> | undefined;
}

class Report implements IInternalReport {
    private lcovEntries?: LCOVEntry[];

    createReport(data: string): void {
        const records = data.split('end_of_record');
        this.lcovEntries = coalesce(records.map(r => createLCOVEntry(r)));
    }

    // stats(matches: { name: string; match: string }): CategoryStat[] | undefined;
    stats(matches: string[] = [] /*| { name: string; match: string }*/): /*CategoryStat[] | */Stats | undefined {
        if (!this.lcovEntries) {
            return;
        }

        const stats: Stats = { lines: { actual: 0, max: 0 }, branches: { actual: 0, max: 0 }, functions: { actual: 0, max: 0} };
        for (const entry of this.lcovEntries) {
            if (matches.every(m => minimatch(entry.SF, m))) {
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

    files(matches: string[] = []): Array<string> | undefined {
        if (!this.lcovEntries) {
            return;
        }

        const files = this.lcovEntries.map(l => l.SF);

        if (matches) {
            return files.filter(f => matches.every(m => minimatch(f, m)));
        } else {
            return files;
        }
    }
}

comlink.expose(Report);

import { LCOVEntry, createLCOVReport } from './lcov';
import minimatch from 'minimatch';
import * as comlink from 'comlink';

interface CoverageEntry {
    file: string;
    branchesFound: number;
    branchesHit: number;
    linesFound: number;
    linesHit: number;
    functionsFound: number;
    functionsHit: number;
    statementsFound?: number;
    statementsHit?: number;
}

export interface Stat {
    found: number;
    hit: number;
}

export interface Stats {
    lines: Stat;
    branches: Stat;
    functions: Stat;
    statements?: Stat;
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

function fromLCOV(entry: LCOVEntry): CoverageEntry {
    return {
        branchesFound: entry.BRF,
        branchesHit: entry.BRH,
        file: entry.SF,
        functionsFound: entry.FNF,
        functionsHit: entry.FNH,
        linesFound: entry.LF,
        linesHit: entry.LH
    }
}

class Report implements IInternalReport {
    private entries?: CoverageEntry[];

    createReport(data: string): void {
        try {
            this.entries = createLCOVReport(data)?.map(e => fromLCOV(e));
        } catch (e) {
            console.warn('Failed to create lcov report')
        }
    }

    stats(matches: string[] = []): Stats | undefined {
        if (!this.entries) {
            return;
        }

        const stats: Stats = { lines: { hit: 0, found: 0 }, branches: { hit: 0, found: 0 }, functions: { hit: 0, found: 0} };
        for (const entry of this.entries) {
            if (matches.every(m => minimatch(entry.file, m))) {
                stats.lines.hit += entry.linesHit;
                stats.lines.found += entry.linesFound;
                stats.branches.hit += entry.branchesHit;
                stats.branches.found += entry.branchesFound;
                stats.functions.hit += entry.functionsHit;
                stats.functions.found += entry.functionsFound;
            }
        }

        return stats;
    }

    files(matches: string[] = []): Array<string> | undefined {
        if (!this.entries) {
            return;
        }

        const files = this.entries.map(l => l.file);

        if (matches) {
            return files.filter(f => matches.every(m => minimatch(f, m)));
        } else {
            return files;
        }
    }
}

comlink.expose(Report);

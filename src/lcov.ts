import { coalesce } from "./base/common/arrays";

export interface LCOVEntry {
    /**
     * Source File
     */
    SF: string;
    /**
     * function [line number, name]
     */
    FN: [number, string][];
    /**
     * number of functions found
     */
    FNF: number;
    /**
     * number of functions hit
     */
    FNH: number;
    /**
     * execution count per function [count, name]
     */
    FNDA: [number, string][];
    /**
     * execution count per line [line number, count]
     */
    DA: [number, number][];
    /**
     * number of instrumented lines
     */
    LF: number;
    /**
     * number of lines with non-zero execution count
     */
    LH: number;
    /**
     * number of branches found
     */
    BRF: number;
    /**
     * number of branches hit
     */
    BRH: number;
}

export function createLCOVEntry(itemString: string): LCOVEntry | undefined {
    const entry: LCOVEntry = Object.create(null);
    const items = itemString.split(/\r?\n/);
    items.forEach(s => {
        let [key, ...valueArray] = s.split(':') as [keyof LCOVEntry, string];
        let value = valueArray.join(':');
        if (!key || (key as string) === 'TN') {
            return;
        }
        switch (key) {
            case 'SF': {
                value = value.slice(value.indexOf('src')).replace(/\\/g, '/');
                entry[key] = value;
                break;
            }
            case 'FN': {
                if (!entry[key]) {
                    entry[key] = [];
                }
                const [lineNumber, name] = value.split(',');
                entry[key].push([Number(lineNumber), name])
                break;
            }
            case 'FNDA': {
                if (!entry[key]) {
                    entry[key] = [];
                }
                const [count, name] = value.split(',');
                entry[key].push([Number(count), name]);
                break;
            }
            case 'DA': {
                if (!entry[key]) {
                    entry[key] = [];
                }
                const [lineNumber, count] = value.split(',');
                entry[key].push([Number(lineNumber), Number(count)]);
                break;
            }
            case 'FNF':
            case 'FNH':
            case 'LF':
            case 'LH':
            case 'BRF':
            case 'BRH':
                entry[key] = Number(value);
                break;
        }
    });
    if (Object.keys(entry).length === 0) {
        return undefined;
    }
    return entry;
}

export function createLCOVReport(data: string): LCOVEntry[] {
    const records = data.split('end_of_record');
    return coalesce(records.map(r => createLCOVEntry(r)));
}

import { coalesce } from "./base/common/arrays";

export interface LCOVEntry {
    /**
     * Source File
     */
    SF: string;
    /**
     * function [line number, name]
     */
    FN: [number, string];
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
    FNDA: [number, string];
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
    const entry = Object.create(null);
    const items = itemString.split(/\r?\n/);
    items.forEach(s => {
        let [key, ...valueArray] = s.split(':') as [keyof LCOVEntry, string];
        let value = valueArray.join(':');
        if (!key || (key as string) === 'TN') {
            return;
        }
        if (key === 'SF') {
            // start at src
            value = value.slice(value.indexOf('src')).replace(/\\/g, '/');
        }
        entry[key] = value.indexOf(',') > -1 ? value.split(',').map(v => isNaN(Number(v)) ? v : Number(v)) : isNaN(Number(value)) ? value : Number(value);
    });
    if (Object.keys(entry).length === 0) {
        return undefined;
    }
    return entry;
}

export function createLCOVReport(data: string): LCOVEntry[] | undefined {
    const records = data.split('end_of_record');
    return coalesce(records.map(r => createLCOVEntry(r)));
}

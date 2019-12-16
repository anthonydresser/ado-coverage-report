import { Report } from "./reportBuilder";
import { Emitter } from "./base/common/event";

export class GlobalStats {
    constructor(container: HTMLElement, private readonly report: Report) { }

    render(filter?: string): void {

    }
}

export class FileTable {
    private readonly _onItemSelect = new Emitter<string>();
    public readonly onItemSelect = this._onItemSelect.event;

    constructor(container: HTMLElement, private readonly report: Report) { }

    render(filter?: string): void {

    }
}

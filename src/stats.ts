import { IReport, Stats } from "./reportBuilder";
import { Emitter } from "./base/common/event";
import { addClass, clearNode } from "./base/browser/dom";

export class GlobalStats {
    private readonly container: HTMLElement;
    private readonly linesPercent: HTMLElement;
    private readonly linesNumber: HTMLElement;
    private readonly branchesPercent: HTMLElement;
    private readonly branchesNumber: HTMLElement;
    private readonly functionsPercent: HTMLElement;
    private readonly functionsNumber: HTMLElement;

    constructor(parent: HTMLElement, private readonly report: IReport) {
        this.container = document.createElement('div');
        addClass(this.container, 'global-stats');
        parent.appendChild(this.container);

        const linesContainer = document.createElement('div');
        addClass(linesContainer, 'stats-container');
        this.linesPercent = document.createElement('div');
        addClass(this.linesPercent, 'percent');
        linesContainer.appendChild(this.linesPercent);
        const linesLabel = document.createElement('div');
        addClass(linesLabel, 'label');
        linesLabel.innerText = 'Lines'
        linesContainer.appendChild(linesLabel);
        this.linesNumber = document.createElement('div');
        addClass(this.linesNumber, 'number');
        linesContainer.appendChild(this.linesNumber);
        this.container.appendChild(linesContainer);

        const branchesContainer = document.createElement('div');
        addClass(branchesContainer, 'stats-container');
        this.branchesPercent = document.createElement('div');
        addClass(this.branchesPercent, 'percent');
        branchesContainer.appendChild(this.branchesPercent);
        const branchesLabel = document.createElement('div');
        addClass(branchesLabel, 'label');
        branchesLabel.innerText = 'Branches'
        branchesContainer.appendChild(branchesLabel);
        this.branchesNumber = document.createElement('div');
        addClass(this.branchesNumber, 'number');
        branchesContainer.appendChild(this.branchesNumber);
        this.container.appendChild(branchesContainer);
        
        const functionsContainer = document.createElement('div');
        addClass(functionsContainer, 'stats-container');
        this.functionsPercent = document.createElement('div');
        addClass(this.functionsPercent, 'percent');
        functionsContainer.appendChild(this.functionsPercent);
        const functionsLabel = document.createElement('div');
        addClass(functionsLabel, 'label');
        functionsLabel.innerText = 'Functions'
        functionsContainer.appendChild(functionsLabel);
        this.functionsNumber = document.createElement('div');
        addClass(this.functionsNumber, 'number');
        functionsContainer.appendChild(this.functionsNumber);
        this.container.appendChild(functionsContainer);
    }

    async render(filter?: string): Promise<void> {
        const stats = await this.report.stats(filter);
        if (stats) {
            this.linesPercent.innerText = `${Math.round((stats.lines.actual / stats.lines.max) * 10000)/100}%`
            this.linesNumber.innerText = `${stats.lines.actual}/${stats.lines.max}`;
            this.branchesPercent.innerText = `${Math.round((stats.branches.actual / stats.branches.max) * 10000)/100}%`
            this.branchesNumber.innerText = `${stats.branches.actual}/${stats.branches.max}`;
            this.functionsPercent.innerText = `${Math.round((stats.functions.actual / stats.functions.max) * 10000)/100}%`
            this.functionsNumber.innerText = `${stats.functions.actual}/${stats.functions.max}`;
        }
    }
}

export class FileTable {
    private readonly _onItemSelect = new Emitter<string>();
    public readonly onItemSelect = this._onItemSelect.event;
    private table: HTMLTableElement;

    constructor(parent: HTMLElement, private readonly report: IReport) {
        const container = document.createElement('div');
        container.innerText = 'File Table';
        addClass(container, 'file-table');
        parent.appendChild(container);
        const tableContainer = document.createElement('div');
        container.append(tableContainer);
        this.table = document.createElement('table');
        tableContainer.appendChild(this.table);
    }

    async render(filter?: string): Promise<void> {
        clearNode(this.table);
        const files = await this.report.files(filter);
        files?.forEach(async (v, i) => {
            const stats = await this.report.stats(v);
            if (stats) {
                const row = this.table.insertRow(i);
                this.fillRow(row, v, stats);
            }
        });
    }

    private fillRow(row: HTMLTableRowElement, path: string, stats: Stats): void {
        row.insertCell().innerText = path;
    }
}

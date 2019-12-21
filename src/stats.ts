import { IReport, Stats } from "./reportBuilder";
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

    async render(filter: string[] = []): Promise<void> {
        const stats = await this.report.stats(filter);
        if (stats) {
            this.branchesPercent.innerText = `${Math.round((stats.branches.actual / stats.branches.max) * 10000)/100}%`
            this.branchesNumber.innerText = `${stats.branches.actual}/${stats.branches.max}`;
            this.functionsPercent.innerText = `${Math.round((stats.functions.actual / stats.functions.max) * 10000)/100}%`
            this.functionsNumber.innerText = `${stats.functions.actual}/${stats.functions.max}`;
            this.linesPercent.innerText = `${Math.round((stats.lines.actual / stats.lines.max) * 10000)/100}%`
            this.linesNumber.innerText = `${stats.lines.actual}/${stats.lines.max}`;
        }
    }
}

export class FileTable {
    private tableBody: HTMLTableSectionElement;
    private tableHeader: HTMLTableSectionElement;

    constructor(parent: HTMLElement, private readonly report: IReport) {
        const container = document.createElement('div');
        container.innerText = 'File Table';
        addClass(container, 'file-table-container');
        parent.appendChild(container);
        const tableContainer = document.createElement('div');
        container.append(tableContainer);
        const table = document.createElement('table');
        addClass(table, 'file-table');
        tableContainer.appendChild(table);
        this.tableBody = document.createElement('tbody');
        this.tableHeader = document.createElement('thead');
        table.appendChild(this.tableHeader);
        table.appendChild(this.tableBody);
    }

    async render(filter: string[] = []): Promise<void> {
        clearNode(this.tableBody);
        const files = await this.report.files(filter);
        if (files) {
            const fileMap = files.reduce((p, c) => {
                let current = p;
                c.split('/').forEach((v, i) => {
                    if (v) {
                        if (!current[v]) {
                            current[v] = Object.create(null);
                        }
                        current = current[v];
                    }
                });
                return p;
            }, Object.create(null));

            const buildStrings = (map: { [key: string]: any }): Array<[string, boolean]> => {
                // end of the line
                const keys = Object.keys(map);
                if (keys.length === 1 && Object.keys(map[keys[0]]).length === 0) {
                    return [[keys[0], true]];
                }

                return keys.reduce((p, c) => {
                    // end of commonality
                    if (keys.length > 1) {
                        p.push([c, Object.keys(map[c]).length === 0]);
                        return p;
                    }
                    for (const [path, isFile] of buildStrings(map[c])) {
                        p.push([[c, path].join('/'), isFile]);
                    }
                    return p;
                }, [] as [string, boolean][]);
            };

            const paths = buildStrings(fileMap);

            paths.forEach(async ([path, isFile], i) => {
                const stats = await this.report.stats([`**/${path}${isFile ? '' : '/**'}`]);
                if (stats) {
                    const row = this.tableBody.insertRow(i);
                    this.fillRow(row, path, stats);
                }
            });
        }
    }

    private fillRow(row: HTMLTableRowElement, path: string, stats: Stats): void {
        const branchespc = Math.round((stats.branches.actual / stats.branches.max) * 10000)/100;
        const functionspc = Math.round((stats.functions.actual / stats.functions.max) * 10000)/100;
        const linespc = Math.round((stats.lines.actual / stats.lines.max) * 10000)/100;

        // path cell
        const fileCell = row.insertCell();
        const fileLink = document.createElement('a');
        fileLink.href = `#${path}`;
        fileLink.innerText = path;
        addClass(fileCell, pcToColor(branchespc));
        fileCell.appendChild(fileLink);
        addClass(fileCell, 'file');

        // bar cell
        const barCell = row.insertCell();
        barCell.innerText = 'this would be the bar';
        addClass(barCell, pcToColor(branchespc));

        // brnaches pc
        const branchespcCell = row.insertCell();
        branchespcCell.innerText = `${isNaN(branchespc) ? 100 : branchespc}%`;
        addClass(branchespcCell, pcToColor(branchespc));

        // branches nm
        const branchesnmCell = row.insertCell();
        branchesnmCell.innerText = `${stats.branches.actual}/${stats.branches.max}`;
        addClass(branchesnmCell, pcToColor(branchespc));

        // function pc
        const functionspcCell = row.insertCell();
        functionspcCell.innerText = `${isNaN(functionspc) ? 100 : functionspc}%`;
        addClass(functionspcCell, pcToColor(functionspc));

        // functions nm
        const functionsnmCell = row.insertCell();
        functionsnmCell.innerText = `${stats.functions.actual}/${stats.functions.max}`;
        addClass(functionsnmCell, pcToColor(functionspc));

        // lines pc
        const linespcCell = row.insertCell();
        linespcCell.innerText = `${isNaN(linespc) ? 100 : linespc}%`
        addClass(linespcCell, pcToColor(linespc));

        // lines number
        const linesnmCell = row.insertCell();
        linesnmCell.innerText = `${stats.lines.actual}/${stats.lines.max}`;
        addClass(linesnmCell, pcToColor(linespc));
    }
}

function pcToColor(pc: number): string {
    return isNaN(pc) ? 'high' : pc > 80 ? 'high' : pc > 50 ? 'medium' : 'low'
}

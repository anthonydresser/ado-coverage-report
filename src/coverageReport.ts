import { IReport } from "./reportBuilder";
import { addClass } from "./base/browser/dom";
import { GlobalStats, FileTable } from "./stats";
import * as comlink from 'comlink';

const Reporter = comlink.wrap(new Worker('out/reportBuilder.js'));

export class CoverageReport {
    private report?: IReport
    private parent?: HTMLElement;
    private minimatchInput?: HTMLInputElement;
    private globalStats?: GlobalStats;
    private fileTable?: FileTable;

    constructor(private readonly container: HTMLElement, private readonly lcovString: string) {
    }

    public async initialize(): Promise<void> {
        this.report = (await new (Reporter as any)()) as IReport;
        await this.report.createReport(this.lcovString);
        this.parent = document.createElement('div');
        addClass(this.parent, 'coverage-report');
        this.minimatchInput = document.createElement('input');
        this.minimatchInput.addEventListener('change', e => this.onInputChange(e));
        addClass(this.minimatchInput, 'minimatch-input');
        this.parent.appendChild(this.minimatchInput);
        const globalStatsContainer = document.createElement('div');
        this.globalStats = new GlobalStats(globalStatsContainer, this.report);
        this.parent.appendChild(globalStatsContainer);
        const fileTableContainer = document.createElement('div');
        this.fileTable = new FileTable(fileTableContainer, this.report);
        this.parent.appendChild(fileTableContainer); 
        this.container.appendChild(this.parent);
        this.globalStats.render();
        this.fileTable.render();
    }

    private onInputChange(e: Event): void {
        this.globalStats!.render(this.minimatchInput!.value);
        this.fileTable!.render(this.minimatchInput!.value);
    }
}
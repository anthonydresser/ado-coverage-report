import { Report } from "./reportBuilder";
import { addClass } from "./base/browser/dom";
import { GlobalStats, FileTable } from "./stats";

export class CoverageReport {
    private readonly report = new Report();
    private readonly parent: HTMLElement;
    private readonly globalStats: GlobalStats;
    private readonly fileTable: FileTable;

    constructor(container: HTMLElement, lcovString: string) {
        this.report.createReport(lcovString);
        this.parent = document.createElement('div');
        addClass(this.parent, 'coverage-report');
        const input = document.createElement('input');
        addClass(input, 'minimatch-input');
        this.parent.appendChild(input);
        const globalStatsContainer = document.createElement('div');
        this.globalStats = new GlobalStats(globalStatsContainer, this.report);
        this.parent.appendChild(globalStatsContainer);
        const fileTableContainer = document.createElement('div');
        this.fileTable = new FileTable(fileTableContainer, this.report);
        this.parent.appendChild(fileTableContainer); 
    }  
}
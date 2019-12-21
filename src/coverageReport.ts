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

    private context?: string;
    private filter?: string;

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
        if (window.location.hash) {
            this.context = `**/${window.location.hash.slice(1)}/**`;
        }
        this.render();
        window.addEventListener('hashchange', () => {
            this.onContextChange(window.location.hash.slice(1));
        }, false)
    }

    private onInputChange(e: Event): void {
        this.filter = this.minimatchInput!.value;
        this.render();
    }

    private onContextChange(path: string): void {
        this.context = `**/${path}/**`;
        this.render();
    }

    private render(): void {
        const filter = [];
        if (this.context) {
            filter.push(this.context);
        }
        if (this.filter) {
            filter.push(this.filter);
        }

        this.globalStats!.render(filter);
        this.fileTable!.render(filter);
    }
}

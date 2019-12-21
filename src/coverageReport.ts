import { IReport } from "./reportBuilder";
import { addClass, addClasses } from "./base/browser/dom";
import { GlobalStats, FileTable } from "./stats";
import * as comlink from 'comlink';

const Reporter = comlink.wrap(new Worker('out/reportBuilder.js'));

export class CoverageReport {
    private report?: IReport
    private parent?: HTMLElement;
    private minimatchInput?: HTMLInputElement;
    private globalStats?: GlobalStats;
    private fileTable?: FileTable;
    private contextLabel?: HTMLElement;

    private context?: string;
    private filter?: string;

    constructor(private readonly container: HTMLElement, private readonly lcovString: string) {
    }

    public async initialize(): Promise<void> {
        this.report = (await new (Reporter as any)()) as IReport;
        await this.report.createReport(this.lcovString);
        this.parent = document.createElement('div');
        addClasses(this.parent, 'coverage-report', 'full-size');
        this.parent.style.display = 'flex';
        this.parent.style.flexDirection = 'column';
        this.minimatchInput = document.createElement('input');
        this.minimatchInput.addEventListener('change', e => this.onInputChange(e));
        addClass(this.minimatchInput, 'minimatch-input');
        this.parent.appendChild(this.minimatchInput);
        this.contextLabel = document.createElement('h2');
        this.contextLabel.innerText = 'All Files';
        this.parent.appendChild(this.contextLabel);
        const globalStatsContainer = document.createElement('div');
        this.globalStats = new GlobalStats(globalStatsContainer, this.report);
        this.parent.appendChild(globalStatsContainer);
        const fileTableContainer = document.createElement('div');
        fileTableContainer.style.flex = '1 1 auto';
        fileTableContainer.style.overflow = 'hidden';
        this.fileTable = new FileTable(fileTableContainer, this.report);
        this.parent.appendChild(fileTableContainer); 
        this.container.appendChild(this.parent);
        window.addEventListener('hashchange', () => {
            this.onContextChange(window.location.hash.slice(1));
        }, false);
        if (window.location.hash) {
            this.onContextChange(window.location.hash.slice(1));
        } else {
            this.render();
        }
    }

    private onInputChange(e: Event): void {
        this.filter = this.minimatchInput!.value;
        this.render();
    }

    private onContextChange(path: string): void {
        this.contextLabel!.innerText = path;
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

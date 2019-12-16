import * as controls from 'VSS/Controls';
import * as buildExtensionContracts from "TFS/Build/ExtensionContracts";
import * as buildContracts from 'TFS/Build/Contracts';
import * as buildClient from 'TFS/Build/RestClient';
import * as strings from './base/common/strings';
import { Report, StatEntry } from './reportBuilder';
import { clearNode } from './base/browser/dom';
import { CoverageReport } from './coverageReport';

class CoverageTab extends controls.BaseControl {
    private config: buildExtensionContracts.IBuildResultsViewExtensionConfig = VSS.getConfiguration()
    private report = new Report();

    public initialize(): void {
        super.initialize();

        this.config.onBuildChanged((build: buildContracts.Build) => {
            this.findCoverageReport(build)
        });
    }

    private async findCoverageReport(build: buildContracts.Build): Promise<void> {
        try {
            const vsoContext = VSS.getWebContext();
            const buildinstance = buildClient.getClient();
            const projectId = vsoContext.project.id;
            const coverageData = (await buildinstance.getArtifacts(build.id, projectId));
            const documentUri = generateResourceUri(coverageData, build.id, vsoContext);
            if (documentUri) {
                const coverageInfo = (await (await fetch(documentUri)).text());
                this.report.createReport(coverageInfo);
                const container = this.getElement().get(0);
                new CoverageReport(container, coverageInfo);
                const input = document.createElement('input');
                const statContainer = document.createElement('div');
                const withStats = (stats: StatEntry[]): void => {
                    clearNode(statContainer)
                    stats.forEach(v => {
                        const labelContainer = document.createElement('h1');
                        statContainer.appendChild(labelContainer);
                        labelContainer.innerText = v.name;
                        const numberContainer = document.createElement('div');
                        statContainer.appendChild(numberContainer);
                        numberContainer.innerText = `${Math.round((v.stats.actual / v.stats.max) * 10000)/100}% (${v.stats.actual}/${v.stats.max})`;
                    });
                }
                withStats(this.report.stats()!);
                let timeoutDebouce = 0;
                input.onchange = () => {
                    clearTimeout(timeoutDebouce);
                    setTimeout(() => {
                        const stats = this.report.stats(input.value);
                        if (stats) {
                            withStats(stats);
                        }
                    }, 500);
                };

                container.appendChild(input);
                container.appendChild(statContainer);
            } else {
                throw new Error('Could not get uri for coverage numbers');
            }
        } catch (e) {
            console.warn('failed to find coverage data', e);
        }
    }
}

function generateResourceUri(artifacts: buildContracts.BuildArtifact[], buildId: number, context: WebContext): string | undefined {
    const artifact = artifacts.find(e => e.name === strings.format("Code Coverage Report_{0}", buildId));
    if (artifact?.resource?._links?.web?.href?.length && artifact?.resource?.data?.length) {
        let resource = artifact.resource.data;
        if (resource.charAt(0) === '#') {
            resource = resource.substring(1);
        }
        if (resource.charAt(0) === '/') {
            resource = '/' + resource;
        }
        return `${context.account.uri}${context.project.id}/_apis/test/CodeCoverage/browse${resource}/lcov.info`
    }
    return;
}

const htmlContainer = document.getElementById("container")!;
const configuration = VSS.getConfiguration();

if (typeof configuration.onBuildChanged === "function") {
    CoverageTab.enhance(CoverageTab, htmlContainer, {});
} 
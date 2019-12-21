import * as controls from 'VSS/Controls';
import * as buildExtensionContracts from "TFS/Build/ExtensionContracts";
import * as buildContracts from 'TFS/Build/Contracts';
import * as buildClient from 'TFS/Build/RestClient';
import * as strings from './base/common/strings';
import { CoverageReport } from './coverageReport';

class CoverageTab extends controls.BaseControl {
    private config: buildExtensionContracts.IBuildResultsViewExtensionConfig = VSS.getConfiguration()

    public async initialize(): Promise<void> {
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
                const container = this.getElement().get(0);
                const report = new CoverageReport(container, coverageInfo);
                await report.initialize();
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

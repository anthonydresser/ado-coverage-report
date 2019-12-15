import * as controls from 'VSS/Controls';
import * as buildExtensionContracts from "TFS/Build/ExtensionContracts";
import * as buildContracts from 'TFS/Build/Contracts';
import * as trClient from 'TFS/TestManagement/VSS.TestResults.WebApi';

class CoverageTab extends controls.BaseControl {
    private config: buildExtensionContracts.IBuildResultsViewExtensionConfig = VSS.getConfiguration()

    public initialize(): void {
        super.initialize();

        this.config.onBuildChanged((build: buildContracts.Build) => {
            this.findCoverageReport(build)
        });
    }

    private async findCoverageReport(build: buildContracts.Build): Promise<void> {
        try {
            const vsoContext: WebContext = VSS.getWebContext();
            const taskClient: trClient.TestResultsHttpClient5 = trClient.getClient();
            const projectId = vsoContext.project.id;
            const coverageData = (await taskClient.getCodeCoverageSummary(projectId, build.id)).coverageData;
            console.log('coverageData', coverageData);
        } catch (e) { }
    }
}

const htmlContainer = document.getElementById("container")!;
const configuration = VSS.getConfiguration();

if (typeof configuration.onBuildChanged === "function") {
    CoverageTab.enhance(CoverageTab, htmlContainer, {});
} 
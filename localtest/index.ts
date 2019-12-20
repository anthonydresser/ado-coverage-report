import { CoverageReport } from '../src/coverageReport';

const fileBrowser = document.getElementById('filebrowser') as HTMLInputElement;

const reportContainer = document.getElementById('report');

fileBrowser.addEventListener('change', e => {
    const files = (e.target as any).files as FileList;
    const reader = new FileReader();
    reader.addEventListener('load', async event => {
        const contents = event.target.result;
        const report = new CoverageReport(reportContainer, contents as string);
        await report.initialize();
    });
    reader.readAsText(files[0]);
});
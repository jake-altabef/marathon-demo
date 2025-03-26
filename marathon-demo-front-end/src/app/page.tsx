import PdfViewer from "./components/PdfViewer";
import CsvTable from "./components/CsvTable";

export default function Home() {
  return (
    <div className="flex gap-4 p-4">
      <div className="w-1/2">
        <h2 className="text-lg font-semibold mb-2">PDF Viewer</h2>
        <PdfViewer pdfUrl="/api/pdf" />
      </div>
      <div className="w-1/2">
        <h2 className="text-lg font-semibold mb-2">CSV Data</h2>
        <CsvTable csvUrl="/api/csv" />
      </div>
    </div>
  );
}

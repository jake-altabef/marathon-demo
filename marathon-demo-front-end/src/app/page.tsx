"use client"
import { useState } from "react";
import FileSelector from "./components/FileSelector";
import PdfViewer from "./components/PdfViewer";
import CsvTable from "./components/CsvTable";

export default function Dashboard() {
  const [pdfKey, setPdfKey] = useState("");

  return (
    <div className="p-4 space-y-4">
      <FileSelector onSelect={(pdf) => { setPdfKey(pdf)}} />
      
      <div className="flex space-x-4">
        <div className="w-1/2 border rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-2">PDF Viewer</h2>
          <PdfViewer pdfKey={pdfKey} />
        </div>
        {/* <div className="w-1/2 border rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-2">CSV Data</h2>
          <CsvTable csvKey={csvKey} />
        </div> */}
      </div>
    </div>
  );
}
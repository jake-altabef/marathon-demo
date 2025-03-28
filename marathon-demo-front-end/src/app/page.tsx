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
          <PdfViewer pdfKey={pdfKey} />
        </div>
        <div className="w-1/2 border rounded-lg p-4 shadow">
          <CsvTable pdfKey={pdfKey} />
        </div>
      </div>
    </div>
  );
}
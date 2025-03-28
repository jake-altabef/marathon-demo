"use client"
import { useState } from "react";
import PdfFileSelector from "./components/PdfFileSelector";
import ResultFileSelector from "./components/ResultFileSelector";
import PdfViewer from "./components/PdfViewer";
import CsvTable from "./components/CsvTable";

export default function Dashboard() {
  const [pdfKey, setPdfKey] = useState("");
  const [resultSetKey, setResultSetKey] = useState("");

  return (
    <div className="p-4 space-y-4">
      <PdfFileSelector onSelect={(pdf) => { setPdfKey(pdf)}}/>
      <ResultFileSelector onSelect={(csv) => { setResultSetKey(csv)}} pdfKey={pdfKey}/>
      
      <div className="flex space-x-4">
        <div className="w-1/2 border rounded-lg p-4 shadow">
          <PdfViewer pdfKey={pdfKey} />
        </div>
        <div className="w-1/2 border rounded-lg p-4 shadow">
          <CsvTable pdfKey={pdfKey} resultKey={resultSetKey} />
        </div>
      </div>
    </div>
  );
}
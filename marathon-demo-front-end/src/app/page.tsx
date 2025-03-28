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
    <div className="max-h-screen p-4 space-y-2 bg-[#F9F6EE] flex flex-col h-screen">
      <div className="flex flex-wrap space-x-16 mb-2">
        <PdfFileSelector onSelect={(pdf) => { setPdfKey(pdf)}}/>
        <ResultFileSelector onSelect={(csv) => { setResultSetKey(csv)}} pdfKey={pdfKey}/>
      </div>

      <div className="flex items-start space-x-4 flex-grow overflow-hidden">
        <div className="h-full w-1/2 border rounded-lg p-4 shadow bg-white overflow-y-auto">
          <PdfViewer pdfKey={pdfKey} />
        </div>
        <div className="h-full w-1/2 border rounded-lg p-4 shadow bg-white overflow-y-auto">
          <CsvTable pdfKey={pdfKey} resultKey={resultSetKey} />
        </div>
      </div>
    </div>
  );
}
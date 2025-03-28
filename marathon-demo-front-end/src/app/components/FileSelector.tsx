"use client";

import { useEffect, useState } from "react";

type FileOption = {
  key: string;
  name: string;
};

type Props = {
  onSelect: (pdfKey: string) => void;
};

const FileSelector = ({ onSelect }: Props) => {
  const [files, setFiles] = useState<FileOption[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch("/api/listFiles?bucket=ingest");
      const data = await response.json();
      
      // Split into PDFs and CSVs
      const pdfFiles = data.filter((file: FileOption) => file.key.endsWith(".pdf"));

      setFiles(pdfFiles);

      if (pdfFiles.length > 0 && !selectedPdf) {
        setSelectedPdf(pdfFiles[0].key);
        onSelect(pdfFiles[0].key);
      }
    };

    fetchFiles();
  }, [onSelect]);

  const handlePdfChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pdfKey = event.target.value;
    setSelectedPdf(pdfKey);
    onSelect(pdfKey);
  };

  return (
    <div className="mb-4 flex space-x-4">
      <div>
        <label className="block text-sm font-medium">Select PDF:</label>
        <select className="border rounded p-2" value={selectedPdf ?? ""} onChange={handlePdfChange}>
          {files?.map((file) => (
            <option key={file.key} value={file.key}>{file.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FileSelector;

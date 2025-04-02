"use client";

import { useEffect, useState } from "react";

type FileOption = {
  key: string;
  name: string;
};

type Props = {
  onSelect: (pdfKey: string) => void;
};

const PdfFileSelector = ({ onSelect }: Props) => {
  const [files, setFiles] = useState<FileOption[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileOption[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPdf, setSelectedPdf] = useState<string | null>("");

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch("/api/listFiles?bucket=ingest");
      const data = await response.json();
      const pdfFiles = data.filter((file: FileOption) => file.key.endsWith(".pdf"));

      setFiles(pdfFiles);
      setFilteredFiles(pdfFiles); // Initialize filtered list with all PDFs

      // Do not reset selectedPdf if already set
      if (!selectedPdf && pdfFiles.length > 0) {
        setSelectedPdf("");  // Ensure "Select PDF" is set initially
        onSelect("");         // Make sure to pass empty string to parent initially
      }
    };

    fetchFiles();
  }, [selectedPdf, onSelect]); // Only fetch once initially

  // Handle filtering based on search input
  useEffect(() => {
    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [searchTerm, files]);

  const handlePdfChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pdfKey = event.target.value;
    setSelectedPdf(pdfKey);
    onSelect(pdfKey);
  };

  return (
    <div className="mb-4 flex flex-col space-y-2">
      <label className="block text-xl font-bold">Select PDF:</label>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search PDFs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded p-2 bg-white"
      />

      {/* Dropdown with Default Option */}
      <select
        className="border rounded p-2 bg-white"
        value={selectedPdf ?? ""}
        onChange={handlePdfChange}
      >
        {/* Default Option */}
        <option value="" disabled={selectedPdf !== ""}>
          Select PDF
        </option>

        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <option key={file.key} value={file.key}>
              {file.name}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No PDFs found
          </option>
        )}
      </select>
    </div>
  );
};

export default PdfFileSelector;

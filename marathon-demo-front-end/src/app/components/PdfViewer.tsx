"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = { pdfKey: string };

const PdfViewer = ({ pdfKey }: Props) => {
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetchPdfUrl = async () => {
      const response = await fetch(`/api/pdf?fileKey=${pdfKey}`);
      const data = await response.json();
      setPdfUrl(data.url);
    };

    fetchPdfUrl();
  }, [pdfKey]);

  return (
    <div className="w-full h-[80vh] overflow-y-auto border rounded-lg p-2">
      {pdfUrl ? (
        <Document file={pdfUrl}>
          <Page pageNumber={1} width={600} />
        </Document>
      ) : (
        <p>Loading PDF...</p>
      )}
    </div>
  );
};

export default PdfViewer;

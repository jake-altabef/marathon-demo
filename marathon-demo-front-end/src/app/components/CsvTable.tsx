"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

type Props = { 
  pdfKey: string;
  resultKey?: string;
};

const FILE_NAME = "InferenceResults.csv"
const CONFIDENCE_INDEX = 3;

const CsvTable = ({ pdfKey, resultKey }: Props) => {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    const fetchCsvUrl = async () => {
      const collatedFilesResponse = await fetch(`/api/listFiles?bucket=collate&prefix=${pdfKey}`);
      const collatedData = await collatedFilesResponse.json();
      const resultKey = filterDataToLatestResultSet(collatedData, pdfKey);

      let fileKey = `${pdfKey}/${resultKey}/${FILE_NAME}`
      const response = await fetch(`/api/csv?fileKey=${fileKey}`);
      const { url } = await response.json();

      const csvResponse = await fetch(url);
      const csvText = await csvResponse.text();
      const parsed = Papa.parse(csvText, { skipEmptyLines: true });

      setData(parsed.data as string[][]);
    };

    fetchCsvUrl();
  }, [pdfKey, resultKey]);

  return (
    <div className="w-full overflow-x-auto">
      {data.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead className="bg-gray-200">
            <tr>
              {data[0].map((col, idx) => (
                <th key={idx} className="border border-gray-400 p-2">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                {row.map((cell, cellIdx) => {
                  let cellStyle = "";

                  if (CONFIDENCE_INDEX !== null && cellIdx === CONFIDENCE_INDEX) {
                    const confidenceValue = parseFloat(cell);
                    if (!isNaN(confidenceValue)) {
                      if (confidenceValue >= 80) {
                        cellStyle = "bg-green-300"; // Green for confidence ≥ 80
                      } else if (confidenceValue >= 50) {
                        cellStyle = "bg-amber-300"; // Amber for 50 ≤ confidence < 80
                      }
                    }
                  }

                  return (
                    <td key={cellIdx} className={`border border-gray-400 p-2 ${cellStyle}`}>
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading CSV data...</p>
      )}
    </div>
  );
};

function filterDataToLatestResultSet(data: FileOption[], pdfKey: string) {
  let csvFiles = data.filter((file: FileOption) => file.key.endsWith(".csv"));
  let resultSetDates = csvFiles.map((file: FileOption) => file.key.replace(pdfKey, "").replace(file.name, "").replaceAll('/','')).sort();
  return resultSetDates.pop();
}

export default CsvTable;
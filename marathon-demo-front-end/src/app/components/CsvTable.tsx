"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

interface CsvTableProps {
  csvUrl: string;
}

const CsvTable: React.FC<CsvTableProps> = ({ csvUrl }) => {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    const fetchCsv = async () => {
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { skipEmptyLines: true });
      setData(parsed.data as string[][]);
    };

    fetchCsv();
  }, [csvUrl]);

  return (
    <div className="w-full overflow-x-auto border rounded-lg p-2">
      {data.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              {data[0].map((col, idx) => (
                <th key={idx} className="border border-gray-400 p-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="border border-gray-400 p-2">
                    {cell}
                  </td>
                ))}
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

export default CsvTable;

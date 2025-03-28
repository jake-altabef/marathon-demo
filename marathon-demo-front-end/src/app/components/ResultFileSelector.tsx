"use client";

import { useEffect, useState } from "react";

type FileOption = {
  key: string;
  name: string;
};

type Props = {
  onSelect: (pdfKey: string) => void;
  pdfKey: string;
};

const ResultFileSelector = ({ onSelect, pdfKey }: Props) => {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!pdfKey) {
        return;
      }

      const response = await fetch(`/api/listFiles?bucket=collate&prefix=${pdfKey}`);
      const data = await response.json();
      const resultSetDates = filterDataToResultSetDates(data, pdfKey);

      setDates(resultSetDates);

      if (resultSetDates.length > 0 && !selectedDate) {
        setSelectedDate(resultSetDates[0]);
        onSelect(resultSetDates[0]);
      }
    };

    fetchFiles();
  }, [onSelect, pdfKey]);

  const handleResultSetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const resultKey = event.target.value;
    setSelectedDate(resultKey);
    onSelect(resultKey);
  };

  return (
    <div className="mb-4 flex space-x-4">
      <div>
        <label className="block text-xl font-bold font-large">Select Inference Result Set:</label>
        <select className="border rounded p-2 bg-white" value={selectedDate ?? ""} onChange={handleResultSetChange}>
          {dates?.map((date) => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

function filterDataToResultSetDates(data: FileOption[], pdfKey: string) {
  let csvFiles = data.filter((file: FileOption) => file.key.endsWith(".csv"));
  let resultSetDates = csvFiles.map((file: FileOption) => file.key.replace(pdfKey, "").replace(file.name, "").replaceAll('/',''));
  return resultSetDates;
}

export default ResultFileSelector;

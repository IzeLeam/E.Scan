"use client";

import { useState } from "react";

export default function SearchInput() {
  const [data, setData] = useState(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ean = e.target.value;
    if (/^\d+$/.test(ean)) {
      const res = await fetch(`https://api.escan.lucaprc.fr/search?ean=${ean}`);
      const fetchedData = await res.json();
      setData(fetchedData);
    }
  };

  return (
    <div style={{ color: "white" }}>
      <input
        type="text"
        pattern="\d*"
        inputMode="numeric"
        placeholder="Enter EAN code"
        onChange={handleChange}
        style={{
          marginBottom: "20px",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {data && (
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
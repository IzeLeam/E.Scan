"use client";

export default function SearchInput() {
  return (
    <input
      type="text"
      pattern="\d*"
      inputMode="numeric"
      placeholder="Enter EAN code"
      onChange={async (e) => {
        const ean = e.target.value;
        if (/^\d+$/.test(ean)) {
          const res = await fetch(`https://api.escan.lucaprc.fr/search?ean=${ean}`);
          const data = await res.json();
          console.log(data);
        }
      }}
    />
  );
}
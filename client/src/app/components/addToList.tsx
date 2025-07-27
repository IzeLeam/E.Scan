"use client";

import { useRef, useState, useEffect } from "react";

type Product = {
  ean: string;
  quantity: number;
};

type List = {
  id: string;
  name: string;
  products: Product[];
  lastModified: Date;
  creationDate: Date;
};

export default function AddToList({ ean }: { ean: string }) {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1); // Commence à 1 pour éviter confusion

  const selectRef = useRef<HTMLSelectElement>(null);

  const fetchLists = async () => {
    try {
      const response = await fetch("https://api.escan.lucaprc.fr/list");
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    }
  };

  const handleChange = async (newQuantity: number) => {
    if (!selectedList || newQuantity < 0) return;
    setQuantity(newQuantity);

    await fetch(`https://api.escan.lucaprc.fr/list/${selectedList}/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ean,
        quantity: newQuantity,
      }),
    });
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <div className="flex w-full my-2 items-center justify-center">
      <select
        ref={selectRef}
        className="bg-(--background) text-white text-center rounded p-2 mx-2"
        value={selectedList || ""}
        onChange={(e) => setSelectedList(e.target.value)}
      >
        <option value="">Select a list</option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name} ({list.products.length} produits)
          </option>
        ))}
      </select>

      <button
        className="bg-(--foreground) w-10 text-white rounded-full p-2 mx-2"
        onClick={() => handleChange(quantity - 1)}
      >
        -
      </button>

      <input
        type="number"
        min="0"
        max="999"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="bg-(--background) text-white text-center rounded p-2 mx-2 w-20"
        aria-label="Quantité"
      />

      <button
        className="bg-(--foreground) w-10 text-white rounded-full p-2 mx-2"
        onClick={() => handleChange(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

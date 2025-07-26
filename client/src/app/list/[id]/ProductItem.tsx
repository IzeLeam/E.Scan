"use client";

import { useEffect, useState } from "react";

export default function ListItem({ item }: { item: string }) {
  const [data, setData] = useState<null | {
    title: string;
    images: string[];
    price: number;
    stock: number;
  }>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`https://api.escan.lucaprc.fr/search?ean=${item}`);
        const fetchedData = await res.json();
        setData(fetchedData);
      } catch (err) {
        console.error("Erreur chargement produit", err);
      }
    };
    loadData();
  }, [item]);

  if (!data) {
    return (
      <li className="w-full h-20 bg-white p-4 rounded-lg shadow-md text-white flex flex-col justify-between">
        <span className="text-sm text-gray-400">Chargement...</span>
      </li>
    );
  }

  return (
    <li className="w-full h-20 bg-white p-4 rounded-lg shadow-md text-black flex justify-between">
      <h3 className="text-md font-semibold max-w-32 overflow-hidden text-ellipsis">
        {data.title}
      </h3>
      <div className="text-sm mt-1">
        <div><strong>Prix :</strong> {data.price} €</div>
        <div><strong>Stock :</strong> {data.stock}</div>
      </div>
      <img
        src={data.images[0]}
        alt={data.title}
        className="h-full object-contain mb-2"
      />
    </li>
  );
}

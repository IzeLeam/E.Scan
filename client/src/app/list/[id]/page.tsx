// app/list/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Product = {
  ean: string;
  quantity?: number;
};

export default function ListDetailPage() {
  const { id } = useParams();
  const [list, setList] = useState<{ name: string; products: Product[] } | null>(null);
  const [ean, setEan] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  const fetchList = () => {
    fetch(`http://localhost:9999/list/${id}`)
      .then(res => res.json())
      .then(data => setList(data));
  };

  useEffect(() => {
    fetchList();
  }, [id]);

  const handleAddProduct = async () => {
    await fetch(`http://localhost:9999/list/${id}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ean, quantity }),
    });
    setEan('');
    fetchList();
  };

  const handleDeleteProduct = async (ean: string) => {
    await fetch(`http://localhost:9999/list/${id}/product/${ean}`, {
      method: 'DELETE',
    });
    fetchList();
  };

  if (!list) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">{list.name}</h1>
      <div className="mb-4">
        <input
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          placeholder="EAN"
          className="border px-3 py-2 mr-2 rounded"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-20 border px-2 py-2 mr-2 rounded"
        />
        <button onClick={handleAddProduct} className="bg-green-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {list.products.map(product => (
          <li key={product.ean} className="flex items-center justify-between">
            <span>{product.ean} - Qty: {product.quantity ?? 1}</span>
            <button
              onClick={() => handleDeleteProduct(product.ean)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

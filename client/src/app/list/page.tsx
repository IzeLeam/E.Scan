// app/list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import ListItem from './ListItem';

interface Product {
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

export default function ListPage() {
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    fetch('https://api.escan.lucaprc.fr/list')
      .then(res => res.json())
      .then(data => setLists(data));
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-6 pt-6 pb-[calc(56px+1.5rem)]">
      {/* Button to create a new list */}
      <div className="fixed right-12 bottom-[calc(56px+1.5rem)]">
        <Link
          href="/new-list"
          className="w-14 h-14 bg-(--foreground) hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          aria-label="Créer une nouvelle liste"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>
      {/* End of button */}

      <h1 className="text-2xl font-bold">List Overview</h1>
      {lists.length === 0 && (
        <p className="text-gray-500 mt-4">No lists found. Create a new one!</p>
      )}
      
      <ul className="w-full mt-4 space-y-2">
        {lists.map(list => (
          <li key={list.id}>
            <ListItem list={list} />
          </li>
        ))}
      </ul>
    </main>
  );
}

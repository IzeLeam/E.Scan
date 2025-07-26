// app/new-list/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NewListPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  

  const handleCreate = async () => {
    await fetch('https://api.escan.lucaprc.fr/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    router.push('/list');
  };

  return (
    <>
    <div className="p-6">
      <h1 className="text-xl mb-4">Create a new list</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="List Name"
        className="border px-3 py-2 rounded mr-2"
      />
      <button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </div>
    {/*}
    <div
          className="relative w-full mb-4"
        >
          <input
            type="text"
            pattern="\d*"
            inputMode="numeric"
            placeholder="List Name"
            autoComplete="off"
            className="w-full px-4 py-2 rounded border pr-10 text-white bg-transparent"
          />
            <motion.button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              aria-label="Effacer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              &#10005;
            </motion.button>
        </div>
        */}
    </>
  );
}

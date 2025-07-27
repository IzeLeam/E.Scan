"use client" 
import Link from 'next/link';

interface Product {
    ean: string;
    quantity: number;
}

type List = {
    id: string;
    name: string;
    products: Product[];
    lastModified: Date;
    creationDate: Date;
}

const formatDate = (date: Date): string => {
    const daysAgo = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    let day = '';
    if (daysAgo === 0) day = 'Today';
    else if (daysAgo === 1) day = 'Yesterday';
    else if (daysAgo < 7) day = `${daysAgo} days ago`;
    else {
        return new Date(date).toLocaleDateString() + ', ' + new Date(date).toLocaleTimeString();
    }

    return day + ', ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ListItem({ list }: { list: List }) {

  const handleDelete = async () => {
    await fetch(`https://api.escan.lucaprc.fr/list/${list.id}`, {
      method: 'DELETE',
    });
  }

  return (
    <div className="w-full p-4 bg-white border rounded-lg shadow-md flex flex-col">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold max-w-[50%] truncate text-(--background)">
          {list.name}
        </h2>
        <span className="text-gray-500 text-sm text-right min-w-[120px] flex-shrink-0">
          Last updated
          <br />
          {formatDate(list.lastModified)}
        </span>
      </div>

      {/* Contenu principal
      <div className="flex-grow overflow-hidden text-sm text-gray-700">
        <p className="text-gray-500 text-sm">
          {list.products.length} product{list.products.length !== 1 ? 's' : ''}
        </p>
        <hr className="my-1 w-1/2" />
        <ul className="overflow-y-auto pr-1 space-y-1 max-h-[3.5rem]">
          {list.products.map((product) => (
            <li key={product.ean}>
              {product.quantity} x {product.ean}
            </li>
          ))}
        </ul>
      </div>
      */}

      {/* Bouton en bas */}
      <div className="flex items-center jusity-center mt-2 self-end">
        <Link
          href={`/list/${list.id}`}
          className="text-white bg-(--foreground) font-medium shadow rounded-lg text-sm px-5 py-2 inline-flex items-center"
        >
          View details
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ml-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </Link>
        <button
          aria-label="Delete this list"
          onClick={() => handleDelete()}
          className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
        >
          <svg
            fill="#000000"
            viewBox="0 0 48 48"
            data-name="Layer 1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <title></title>
              <path d="M42,3H28a2,2,0,0,0-2-2H22a2,2,0,0,0-2,2H6A2,2,0,0,0,6,7H42a2,2,0,0,0,0-4Z"></path>
              <path d="M39,9a2,2,0,0,0-2,2V43H11V11a2,2,0,0,0-4,0V45a2,2,0,0,0,2,2H39a2,2,0,0,0,2-2V11A2,2,0,0,0,39,9Z"></path>
              <path d="M21,37V19a2,2,0,0,0-4,0V37a2,2,0,0,0,4,0Z"></path>
              <path d="M31,37V19a2,2,0,0,0-4,0V37a2,2,0,0,0,4,0Z"></path>
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}

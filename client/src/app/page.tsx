"use client"
import SearchInput from './components/SearchInput';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const ean = searchParams.get('ean') ?? "";

  return (
    <div>
      <SearchInput initialEAN={ean} />
    </div>
  );
}

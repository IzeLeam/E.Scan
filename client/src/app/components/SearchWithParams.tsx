"use client";

import { useSearchParams } from 'next/navigation';
import SearchInput from './SearchInput';

export default function SearchWithParams() {
  const searchParams = useSearchParams();
  const ean = searchParams.get('ean') ?? "";

  return <SearchInput initialEAN={ean} />;
}

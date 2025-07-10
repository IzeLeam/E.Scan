import { Suspense } from 'react';
import SearchWithParams from './components/SearchWithParams';

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Chargement...</div>}>
        <SearchWithParams />
      </Suspense>
    </div>
  );
}

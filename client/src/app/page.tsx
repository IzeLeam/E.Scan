import { Suspense } from 'react';
import SearchWithParams from './components/SearchWithParams';

export default function Home() {
  return (
    <div>
      <Suspense fallback={null}>
        <SearchWithParams />
      </Suspense>
    </div>
  );
}

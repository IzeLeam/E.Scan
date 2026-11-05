import { Suspense } from "react";
import EScan from "@/components/EScan";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* useSearchParams (lien partagé ?ean=) impose une frontière Suspense */}
      <Suspense>
        <EScan />
      </Suspense>
    </main>
  );
}

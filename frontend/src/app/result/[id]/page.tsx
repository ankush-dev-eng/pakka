import { Suspense } from "react";
import ResultContent from "./ResultContent";
import { Loader2 } from "lucide-react";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue mb-4" />
          <p className="text-indigo font-medium">Checking signals...</p>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}

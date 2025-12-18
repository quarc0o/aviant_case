import { fetchPreparations } from "@/actions/fetchPreparations";
import { Suspense } from "react";
import PreparationView from "./components/PreparationView";

export default function Home() {
  const preparations = fetchPreparations();

  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <span>Loading preparations...</span>
            </div>
          </div>
        }
      >
        <PreparationView data={preparations} />
      </Suspense>
    </div>
  );
}

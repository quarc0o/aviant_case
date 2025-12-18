import { fetchPreparations } from "@/actions/fetchPreparations";
import { Suspense } from "react";
import PreparationView from "./components/PreparationView";

export default function Home() {
  const preparations = fetchPreparations();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <PreparationView data={preparations} />
      </Suspense>
    </div>
  );
}

"use client";
import { Preparation } from "@/types/preparation";
import { use } from "react";
import PreparationCard from "./PreparationCard";
import IncomingOrderCard from "./IncomingOrderCard";

interface PreparationViewProps {
  data: Promise<Preparation[]>;
}

export default function PreparationView({ data }: PreparationViewProps) {
  const preparations = use(data);

  // Separate incoming (not accepted) from active (accepted) preparations
  const incomingOrders = preparations.filter(
    (p) => !p.accepted_at && !p.rejected_at && !p.cancelled_at
  );
  const activePreparations = preparations.filter(
    (p) => p.accepted_at && !p.rejected_at && !p.cancelled_at
  );

  if (preparations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-lg">No preparations yet</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Incoming Orders Section */}
      {incomingOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Incoming
            </h2>
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
              {incomingOrders.length}
            </span>
          </div>
          <div className="space-y-2">
            {incomingOrders.map((preparation) => (
              <IncomingOrderCard
                key={preparation.id}
                preparation={preparation}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Preparations Section */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Active
        </h2>
        {activePreparations.length > 0 ? (
          <div className="space-y-4">
            {activePreparations.map((preparation) => (
              <PreparationCard key={preparation.id} preparation={preparation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
            <p>No active preparations</p>
          </div>
        )}
      </section>
    </div>
  );
}

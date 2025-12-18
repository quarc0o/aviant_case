"use client";
import { Preparation } from "@/types/preparation";
import { use, useState } from "react";
import PreparationCard from "./PreparationCard";
import IncomingOrderCard from "./IncomingOrderCard";
import OrderNotifications from "./OrderNotifications";

interface PreparationViewProps {
  data: Promise<Preparation[]>;
}

type Tab = "in_progress" | "completed" | "rejected";

interface TabConfig {
  id: Tab;
  label: string;
}

const TABS: TabConfig[] = [
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
];

export default function PreparationView({ data }: PreparationViewProps) {
  const preparations = use(data);
  const [activeTab, setActiveTab] = useState<Tab>("in_progress");

  // Filter preparations by status
  const incomingOrders = preparations.filter(
    (p) => !p.accepted_at && !p.rejected_at && !p.cancelled_at
  );
  const inProgressOrders = preparations.filter(
    (p) => p.accepted_at && !p.completed_at && !p.rejected_at && !p.cancelled_at
  );
  const completedOrders = preparations.filter((p) => p.completed_at);
  const rejectedOrders = preparations.filter((p) => p.rejected_at);

  const getCount = (tab: Tab): number => {
    switch (tab) {
      case "in_progress":
        return inProgressOrders.length;
      case "completed":
        return completedOrders.length;
      case "rejected":
        return rejectedOrders.length;
    }
  };

  const getTabContent = () => {
    let orders: Preparation[] = [];
    let emptyMessage = "";

    switch (activeTab) {
      case "in_progress":
        orders = inProgressOrders;
        emptyMessage = "No orders in progress";
        break;
      case "completed":
        orders = completedOrders;
        emptyMessage = "No completed orders";
        break;
      case "rejected":
        orders = rejectedOrders;
        emptyMessage = "No rejected orders";
        break;
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {orders.map((preparation) => (
          <PreparationCard key={preparation.id} preparation={preparation} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Notification system for new orders */}
      <OrderNotifications preparations={preparations} />

      {/* Incoming Orders Section - Always visible at top */}
      {incomingOrders.length > 0 && (
        <section className="mb-2">
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {TABS.map((tab) => {
          const count = getCount(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <section>{getTabContent()}</section>
    </div>
  );
}

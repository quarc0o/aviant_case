import Link from "next/link";
import { OrderFilter } from "@/actions/fetchOrders";

interface Tab {
  id: OrderFilter;
  label: string;
}

const TABS: Tab[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

interface OrderTabsProps {
  currentFilter: OrderFilter;
  counts: Record<OrderFilter, number>;
}

export default function OrderTabs({ currentFilter, counts }: OrderTabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      {TABS.map((tab) => {
        const isActive = currentFilter === tab.id;
        const href = tab.id === "all" ? "/" : `/?filter=${tab.id}`;
        const count = counts[tab.id];

        return (
          <Link
            key={tab.id}
            href={href}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              isActive
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

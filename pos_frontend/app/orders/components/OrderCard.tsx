import { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onClick: () => void;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export default function OrderCard({
  order,
  isSelected,
  onClick,
}: OrderCardProps) {
  const itemsSummary = order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? "border-gray-900 bg-gray-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-900">{order.id}</span>
        <span className="text-sm text-gray-400">
          {formatTime(order.created_at)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{itemsSummary}</p>

      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
        <span className="text-sm font-medium text-gray-900">
          ${order.total_price}
        </span>
      </div>
    </button>
  );
}

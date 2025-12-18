import { Order } from "../page";

interface OrderDetailProps {
  order: Order;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
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

export default function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{order.order_id}</h2>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
        <p className="text-gray-500">{formatDateTime(order.created_at)}</p>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          Customer
        </h3>
        <p className="text-gray-900 font-medium">{order.customer_name}</p>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Items
        </h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {item.quantity}x
                  </span>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                {item.notes && (
                  <p className="text-sm text-gray-500 mt-1 ml-6">{item.notes}</p>
                )}
              </div>
              <span className="text-gray-900">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {order.status === "pending" && (
          <>
            <button className="flex-1 py-2 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Accept Order
            </button>
            <button className="py-2 px-4 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              Decline
            </button>
          </>
        )}
        {order.status === "in_progress" && (
          <button className="flex-1 py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}

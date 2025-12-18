import Link from "next/link";
import { fetchOrders, OrderFilter } from "@/actions/fetchOrders";
import { Order } from "@/types/order";
import OrderCard from "../components/OrderCard";
import OrderDetail from "../components/OrderDetail";
import OrderTabs from "../components/OrderTabs";

interface PageProps {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<{ filter?: string }>;
}

function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  switch (filter) {
    case "new":
      return orders.filter((o) => o.status === "CREATED");
    case "in_progress":
      return orders.filter((o) => o.status === "ACCEPTED" || o.status === "DELAYED");
    case "completed":
      return orders.filter((o) => o.status === "DONE");
    default:
      return orders;
  }
}

function countOrders(orders: Order[]) {
  return {
    all: orders.length,
    new: orders.filter((o) => o.status === "CREATED").length,
    in_progress: orders.filter((o) => o.status === "ACCEPTED" || o.status === "DELAYED").length,
    completed: orders.filter((o) => o.status === "DONE").length,
  };
}

export default async function Home({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { filter } = await searchParams;

  const currentFilter = (filter as OrderFilter) || "all";
  const allOrders = await fetchOrders();
  const counts = countOrders(allOrders);
  const orders = filterOrders(allOrders, currentFilter);

  const selectedId = id?.[0] ? parseInt(id[0], 10) : null;
  const selectedOrder = selectedId
    ? allOrders.find((order) => order.id === selectedId) ?? null
    : null;

  const getOrderHref = (orderId: number) => {
    const filterParam = currentFilter !== "all" ? `?filter=${currentFilter}` : "";
    return `/${orderId}${filterParam}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen bg-gray-100">
        {/* Left sidebar - Order cards */}
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
          </div>

          {/* Tabs */}
          <OrderTabs currentFilter={currentFilter} counts={counts} />

          {/* Order list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders found</p>
            ) : (
              orders.map((order) => (
                <Link key={order.id} href={getOrderHref(order.id)}>
                  <OrderCard
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                  />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right panel - Order details */}
        <div className="flex-1 overflow-y-auto">
          {selectedOrder ? (
            <OrderDetail order={selectedOrder} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

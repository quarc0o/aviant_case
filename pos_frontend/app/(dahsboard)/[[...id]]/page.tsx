import Link from "next/link";
import { fetchOrders } from "@/actions/fetchOrders";
import OrderCard from "../components/OrderCard";
import OrderDetail from "../components/OrderDetail";

interface PageProps {
  params: Promise<{ id?: string[] }>;
}

export default async function Home({ params }: PageProps) {
  const { id } = await params;
  const orders = await fetchOrders();

  const selectedId = id?.[0] ? parseInt(id[0], 10) : null;
  const selectedOrder = selectedId
    ? orders.find((order) => order.id === selectedId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen bg-gray-100">
        {/* Left sidebar - Order cards */}
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
          </div>
          <div className="p-3 space-y-2">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active orders</p>
            ) : (
              orders.map((order) => (
                <Link key={order.id} href={`/${order.id}`}>
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

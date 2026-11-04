
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  order_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  restaurant_name: string;
  payment_method: string | null;
  payment_status: string | null;
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/order-history");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load orders.");
        }

        setOrders(data.orders);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-orange-50 p-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-orange-600 hover:underline">
          ← Back to Home
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          My Order History
        </h1>

        <p className="mt-2 text-gray-600">
          View your previous orders and payment details.
        </p>

        {loading && (
          <p className="mt-8 text-gray-600">Loading your orders...</p>
        )}

        {error && (
          <p className="mt-8 text-red-600">{error}</p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <p className="text-gray-700">
              You haven't placed any orders yet.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block font-semibold text-orange-600"
            >
              Explore restaurants →
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{order.order_id}
                  </h2>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {order.status}
                  </span>
                </div>

                <p className="mt-3 text-gray-700">
                  Restaurant: {order.restaurant_name}
                </p>

                <p className="mt-1 text-gray-500">
                  Date: {new Date(order.order_date).toLocaleString()}
                </p>

                <p className="mt-3 text-lg font-bold text-orange-600">
                  Total: ₹{Number(order.total_amount).toFixed(2)}
                </p>

                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-900">
                    Payment Details
                  </h3>

                  <p className="mt-2 text-gray-700">
                    Payment Method: {order.payment_method || "Not available"}
                  </p>

                  <p className="mt-1 text-gray-700">
                    Payment Status:{" "}
                    <span
                      className={`font-semibold ${
                        order.payment_status === "SUCCESS"
                          ? "text-green-700"
                          : order.payment_status === "PENDING"
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    >
                      {order.payment_status || "Not available"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

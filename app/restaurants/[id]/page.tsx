
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Customization = {
  option: string;
  choices: string[];
};

type MenuItem = {
  item_id: number;
  restaurant_id: number;
  name: string;
  dietary_type: string;
  spice_level: string;
  tags: string[];
  customizations: Customization[];
  price: number | null;
  is_available: boolean;
};

type CartItem = {
  item: MenuItem;
  quantity: number;
};

function RestaurantMenuContent() {
  const params = useParams();
  const restaurantId = params.id;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch(
          `/api/restaurant-menu?restaurant_id=${restaurantId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Could not fetch menu.");
        }

        setMenuItems(data.menuItems);
      } catch {
        setError("Unable to load the menu. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (restaurantId) {
      fetchMenu();
    }
  }, [restaurantId]);

  const restaurantNames: Record<string, string> = {
    "1": "Spice Garden",
    "2": "Pizza Corner",
    "3": "Wok Express",
  };

  const restaurantName =
    restaurantNames[String(restaurantId)] || "Restaurant";

  function addToCart(item: MenuItem) {
    setOrderMessage("");

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (cartItem) => cartItem.item.item_id === item.item_id
      );

      if (existingItem) {
        return previousCart.map((cartItem) =>
          cartItem.item.item_id === item.item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...previousCart, { item, quantity: 1 }];
    });
  }

  function updateQuantity(itemId: number, change: number) {
    setOrderMessage("");

    setCart((previousCart) =>
      previousCart
        .map((cartItem) =>
          cartItem.item.item_id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + change }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  }

  const cartTotal = cart.reduce(
    (total, cartItem) =>
      total + (cartItem.item.price || 0) * cartItem.quantity,
    0
  );

  const totalItems = cart.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0
  );

  async function placeOrder() {
    try {
      setPlacingOrder(true);
      setOrderMessage("");

      const response = await fetch("/api/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: Number(restaurantId),
          payment_method: paymentMethod,
          items: cart.map((cartItem) => ({
            item_id: cartItem.item.item_id,
            quantity: cartItem.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not place order.");
      }

      setOrderMessage(
        `Order placed successfully! Order ID: ${data.order_id}. Total: ₹${Number(
          data.total_amount
        ).toFixed(2)}. Payment: ${data.payment_method} (${data.payment_status}).`
      );

      setCart([]);
    } catch (error) {
      setOrderMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <nav className="flex flex-wrap items-center justify-between gap-4 bg-white px-8 py-5 shadow-sm">
        <Link href="/" className="text-2xl font-bold text-orange-600">
          QuickBite 🍴
        </Link>

        <div className="flex items-center gap-6">
          <span className="font-semibold text-orange-600">
            🛒 Cart ({totalItems})
          </span>

          <Link
            href="/orders"
            className="font-medium text-gray-700 hover:text-orange-600"
          >
            My Orders
          </Link>

          <Link
            href="/"
            className="font-medium text-gray-700 hover:text-orange-600"
          >
            ← Back to Restaurants
          </Link>
        </div>
      </nav>

      <section className="px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900">
          {restaurantName}
        </h1>

        <p className="mt-3 text-gray-600">
          Explore our delicious menu!
        </p>

        <h2 className="mb-6 mt-10 text-2xl font-bold text-gray-900">
          Our Menu
        </h2>

        {loading && (
          <p className="text-gray-600">Loading menu...</p>
        )}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && menuItems.length === 0 && (
          <p className="text-gray-600">No menu items available.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <div
              key={item.item_id}
              className="rounded-xl bg-white p-6 shadow-md"
            >
              <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-orange-100 text-6xl">
                🍽️
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                {item.name}
              </h3>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {item.price !== null
                  ? `₹${item.price.toFixed(2)}`
                  : "Price unavailable"}
              </p>

              <p
                className={`mt-2 text-sm font-semibold ${
                  item.is_available
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {item.is_available
                  ? "Available"
                  : "Currently unavailable"}
              </p>

              <p className="mt-2 text-sm text-green-700">
                {item.dietary_type}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Spice level: {item.spice_level}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {item.customizations?.map((customization) => (
                <div
                  key={customization.option}
                  className="mt-4"
                >
                  <p className="font-semibold text-gray-800">
                    {customization.option}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {customization.choices.join(" • ")}
                  </p>
                </div>
              ))}

              <button
                onClick={() => addToCart(item)}
                disabled={!item.is_available || item.price === null}
                className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                + Add to Cart
              </button>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Shopping Cart 🛒
          </h2>

          {cart.length === 0 ? (
            <p className="mt-4 text-gray-600">
              Your cart is empty. Add something delicious!
            </p>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {cart.map((cartItem) => (
                  <div
                    key={cartItem.item.item_id}
                    className="flex flex-wrap items-center justify-between gap-4 border-b pb-4"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {cartItem.item.name}
                      </h3>

                      <p className="text-sm text-gray-600">
                        ₹{cartItem.item.price?.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.item_id, -1)
                        }
                        className="rounded bg-orange-100 px-3 py-1 font-bold text-orange-700"
                      >
                        −
                      </button>

                      <span className="font-semibold">
                        {cartItem.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.item_id, 1)
                        }
                        className="rounded bg-orange-100 px-3 py-1 font-bold text-orange-700"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold text-gray-900">
                      ₹
                      {(
                        (cartItem.item.price || 0) *
                        cartItem.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  Total
                </span>

                <span className="text-2xl font-bold text-orange-600">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  Select Payment Method
                </h3>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                    />

                    <span className="font-medium text-gray-800">
                      UPI (Demo Payment)
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />

                    <span className="font-medium text-gray-800">
                      Cash on Delivery
                    </span>
                  </label>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  UPI is simulated for this project. No real payment will be made.
                </p>
              </div>

              <button
                onClick={placeOrder}
                disabled={cart.length === 0 || placingOrder}
                className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </>
          )}

          {orderMessage && (
            <p className="mt-4 text-center font-semibold text-green-700">
              {orderMessage}
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

export default function RestaurantMenu() {
  return (
    <Suspense
      fallback={<p className="p-8">Loading restaurant...</p>}
    >
      <RestaurantMenuContent />
    </Suspense>
  );
}

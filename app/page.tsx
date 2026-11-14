"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Restaurant = {
  restaurant_id: number;
  name: string;
  address: string;
  cuisine_type: string;
  phone: string;
};

type User = {
  userId: number;
  name: string;
  email: string;
  role: string;
};

export default function Home() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const restaurantResponse = await fetch("/api/restaurants");
        const restaurantData = await restaurantResponse.json();

        if (restaurantData.success) {
          setRestaurants(restaurantData.restaurants);
        }

        const userResponse = await fetch("/api/me");
        const userData = await userResponse.json();

        if (userData.success) {
          setUser(userData.user);
        }
      } catch (error) {
        console.error("Could not load homepage data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    setUser(null);
    router.refresh();
  }

  function getCuisineEmoji(cuisine: string) {
    const emojis: Record<string, string> = {
      Indian: "🍛",
      Italian: "🍕",
      Chinese: "🥡",
    };

    return emojis[cuisine] || "🍽️";
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-5 shadow">
        <Link href="/" className="text-3xl font-bold text-orange-600">
          QuickBite
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700">
                Hi, <strong>{user.name}</strong>
              </span>

              <Link
                href="/orders"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-semibold text-orange-600"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Delicious Food, Delivered Fast!
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Discover restaurants and order your favourite meals with QuickBite.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          Explore Restaurants
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-gray-600">No restaurants available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.restaurant_id}
                className="rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 text-5xl">
                  {getCuisineEmoji(restaurant.cuisine_type)}
                </div>

                <h3 className="text-xl font-bold text-gray-800">
                  {restaurant.name}
                </h3>

                <p className="mt-2 text-gray-600">
                  {restaurant.cuisine_type} Cuisine
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  📍 {restaurant.address}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  📞 {restaurant.phone}
                </p>

                <Link
                  href={`/restaurants/${restaurant.restaurant_id}`}
                  className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600"
                >
                  View Menu →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
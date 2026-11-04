import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import pool from "@/lib/mysql";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = Number(searchParams.get("restaurant_id"));

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    // Get flexible menu details from MongoDB
    const client = await clientPromise;
    const db = client.db("QuickBite");

    const mongoItems = await db
      .collection("MenuItems")
      .find({ restaurant_id: restaurantId })
      .toArray();

    // Get prices and availability from MySQL
    const [mysqlItems] = await pool.execute(
      `SELECT item_id, price, is_available
       FROM MenuItems
       WHERE restaurant_id = ?`,
      [restaurantId]
    );

    const sqlItems = mysqlItems as {
      item_id: number;
      price: number;
      is_available: number;
    }[];

    // Combine both databases using item_id
    const menuItems = mongoItems.map((item) => {
      const sqlItem = sqlItems.find(
        (sql) => sql.item_id === item.item_id
      );

      return {
        ...item,
        price: sqlItem ? Number(sqlItem.price) : null,
        is_available: sqlItem ? Boolean(sqlItem.is_available) : false,
      };
    });

    return NextResponse.json({
      success: true,
      menuItems,
    });
  } catch (error) {
    console.error("Menu API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
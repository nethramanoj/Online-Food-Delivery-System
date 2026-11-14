import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in to view your orders." },
        { status: 401 }
      );
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const [orders]: any = await pool.execute(
      `SELECT
         o.order_id,
         o.order_date,
         o.status,
         o.total_amount,
         r.name AS restaurant_name,
         p.payment_method,
         p.payment_status
       FROM Orders o
       JOIN Restaurants r
         ON o.restaurant_id = r.restaurant_id
       LEFT JOIN Payments p
         ON o.order_id = p.order_id
       WHERE o.user_id = ?
       ORDER BY o.order_date DESC`,
      [user.userId]
    );

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Order history error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch order history.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getCurrentUser } from "@/lib/get-current-user";

type OrderRequestItem = {
  item_id: number;
  quantity: number;
};

export async function POST(request: Request) {
  let connection;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in to place an order." },
        { status: 401 }
      );
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, message: "Only customers can place orders." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const restaurantId = Number(body.restaurant_id);
    const items: OrderRequestItem[] = body.items;
    const paymentMethod = body.payment_method;

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0 ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !["UPI", "COD"].includes(paymentMethod)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order details or payment method." },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const itemId = Number(item.item_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(itemId) ||
        itemId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error("Invalid item or quantity.");
      }

      const [rows]: any = await connection.execute(
        `SELECT item_id, price, is_available
         FROM MenuItems
         WHERE item_id = ? AND restaurant_id = ?`,
        [itemId, restaurantId]
      );

      if (rows.length === 0 || !rows[0].is_available) {
        throw new Error("One or more items are unavailable.");
      }

      const price = Number(rows[0].price);
      totalAmount += price * quantity;

      verifiedItems.push({
        item_id: itemId,
        quantity,
        price,
      });
    }

    const [orderResult]: any = await connection.execute(
      `INSERT INTO Orders
       (user_id, restaurant_id, status, total_amount)
       VALUES (?, ?, 'PLACED', ?)`,
      [user.userId, restaurantId, totalAmount]
    );

    const orderId = orderResult.insertId;

    for (const item of verifiedItems) {
      await connection.execute(
        `INSERT INTO OrderItems
         (order_id, item_id, quantity, item_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.item_id, item.quantity, item.price]
      );
    }

    const paymentStatus =
      paymentMethod === "UPI" ? "SUCCESS" : "PENDING";

    await connection.execute(
      `INSERT INTO Payments
       (order_id, payment_method, payment_status, amount)
       VALUES (?, ?, ?, ?)`,
      [orderId, paymentMethod, paymentStatus, totalAmount]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      order_id: orderId,
      total_amount: totalAmount,
      status: "PLACED",
      payment_method: paymentMethod,
      payment_status: paymentStatus,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Place order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not place order.",
      },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
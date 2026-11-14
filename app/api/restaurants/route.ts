import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT restaurant_id, name, address, cuisine_type, phone FROM Restaurants"
    );

    return NextResponse.json({
      success: true,
      restaurants: rows,
    });
  } catch (error) {
    console.error("Restaurants API error:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch restaurants." },
      { status: 500 }
    );
  }
}
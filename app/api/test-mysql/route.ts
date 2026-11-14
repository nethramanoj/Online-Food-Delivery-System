import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.query("SELECT DATABASE() AS database_name");

    connection.release();

    return NextResponse.json({
      success: true,
      message: "MySQL connected successfully!",
      data: rows,
    });
  } catch (error) {
    console.error("MySQL connection error:", error);

    return NextResponse.json(
      { success: false, message: "MySQL connection failed." },
      { status: 500 }
    );
  }
}
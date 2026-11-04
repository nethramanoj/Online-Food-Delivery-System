import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("quickbite_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not logged in." },
        { status: 401 }
      );
    }

    const user = await verifySession(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);

    return NextResponse.json(
      { success: false, message: "Could not verify session." },
      { status: 500 }
    );
  }
}
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("quickbite_session")?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}
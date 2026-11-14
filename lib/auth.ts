import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is missing from .env.local");
}

const secretKey = new TextEncoder().encode(secret);

export type SessionUser = {
  userId: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

export async function createSession(user: SessionUser) {
  return await new SignJWT({
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}
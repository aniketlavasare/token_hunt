import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Generate a nonce - expects only alphanumeric characters
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Store nonce in cookie (not tamperable by client)
  const cookieStore = await cookies();
  cookieStore.set("siwe", nonce, { 
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 10, // 10 minutes
  });

  console.log("Generated nonce:", nonce);

  return NextResponse.json({ nonce });
}


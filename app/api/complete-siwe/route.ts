import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export const POST = async (req: NextRequest) => {
  const { payload, nonce } = (await req.json()) as IRequestPayload;
  
  console.log("Received SIWE verification request:", { nonce, payload });

  const cookieStore = await cookies();
  const storedNonce = cookieStore.get("siwe")?.value;

  if (nonce !== storedNonce) {
    console.log("Nonce mismatch:", { received: nonce, stored: storedNonce });
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid nonce",
    });
  }

  try {
    const validMessage = await verifySiweMessage(payload, nonce);
    console.log("SIWE verification result:", validMessage);

    // Clear the used nonce
    cookieStore.delete("siwe");

    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
      address: payload.address,
    });
  } catch (error: any) {
    console.error("SIWE verification error:", error);
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message,
    });
  }
};


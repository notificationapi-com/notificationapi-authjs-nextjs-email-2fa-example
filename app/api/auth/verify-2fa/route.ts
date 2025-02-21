import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorCode || !user.twoFactorExp) {
      return NextResponse.json(
        { error: "No 2FA code requested" },
        { status: 400 }
      );
    }

    if (new Date() > user.twoFactorExp) {
      return NextResponse.json({ error: "2FA code expired" }, { status: 400 });
    }

    if (user.twoFactorCode !== code) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
    }

    // Clear the 2FA code and expiration
    await prisma.user.update({
      where: { email },
      data: {
        twoFactorCode: null,
        twoFactorExp: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during 2FA verification" },
      { status: 500 }
    );
  }
}

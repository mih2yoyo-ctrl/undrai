
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get sessions" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await prisma.chatSession.create({
      data: { title: "New Chat" },
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

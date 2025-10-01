
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let currentSessionId = sessionId;

    // Create new session if none exists
    if (!currentSessionId) {
      const session = await prisma.chatSession.create({
        data: { title: message.substring(0, 50) },
      });
      currentSessionId = session.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: message,
        sessionId: currentSessionId,
      },
    });

    // Get chat history
    const history = await prisma.message.findMany({
      where: { sessionId: currentSessionId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messages = history.map((msg: any) => ({
      role: msg?.role || "",
      content: msg?.content || "",
    }));

    // Call LLM API
    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messages,
        stream: true,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error("LLM API request failed");
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader?.read() || { done: true, value: undefined };
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  // Save assistant message
                  await prisma.message.create({
                    data: {
                      role: "assistant",
                      content: buffer,
                      sessionId: currentSessionId,
                    },
                  });

                  // Update session title if it's the first message
                  if (history.length === 1) {
                    await prisma.chatSession.update({
                      where: { id: currentSessionId },
                      data: { title: message.substring(0, 50) },
                    });
                  }

                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  buffer += parsed?.choices?.[0]?.delta?.content || "";
                  controller.enqueue(encoder.encode(line + "\n"));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}

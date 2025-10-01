
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64String = buffer.toString("base64");

    // Use LLM API to extract text from PDF
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "file",
            file: {
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64String}`,
            },
          },
          {
            type: "text",
            text: "Please extract all the text content from this PDF document. Return only the extracted text without any additional commentary.",
          },
        ],
      },
    ];

    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messages,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to extract text");
    }

    const data = await response.json();
    const extractedText = data?.choices?.[0]?.message?.content || "";

    // Create a text file with the extracted content
    const textBlob = Buffer.from(extractedText);
    const dataUrl = `data:text/plain;base64,${textBlob.toString("base64")}`;

    return NextResponse.json({
      url: dataUrl,
      filename: "extracted-text.txt",
      text: extractedText,
    });
  } catch (error: any) {
    console.error("Extract text error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to extract text" },
      { status: 500 }
    );
  }
}

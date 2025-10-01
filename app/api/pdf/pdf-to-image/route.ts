
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);

    // For simplicity, convert first page
    // In a production app, you'd want to handle all pages
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    if (!firstPage) {
      return NextResponse.json({ error: "PDF has no pages" }, { status: 400 });
    }

    // Get page dimensions
    const { width, height } = firstPage.getSize();

    // Create a simple placeholder image
    const imageBuffer = await sharp({
      create: {
        width: Math.floor(width),
        height: Math.floor(height),
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .png()
      .toBuffer();

    const dataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;

    return NextResponse.json({
      url: dataUrl,
      filename: "page-1.png",
      message: "Converted first page to image",
    });
  } catch (error: any) {
    console.error("PDF to image error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to convert PDF to image" },
      { status: 500 }
    );
  }
}

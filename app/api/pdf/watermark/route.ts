
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { uploadFile, downloadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;
    const text = formData.get("text") as string;
    const opacity = parseFloat((formData.get("opacity") as string) || "0.3");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "Watermark text is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    // Add watermark to all pages
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      page.drawText(text, {
        x: width / 2 - (text.length * 10),
        y: height / 2,
        size: 48,
        color: rgb(0.5, 0.5, 0.5),
        opacity: opacity,
        rotate: degrees(45),
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const outputFileName = `${Date.now()}-watermarked.pdf`;
    const s3Key = await uploadFile(
      Buffer.from(pdfBytes),
      outputFileName,
      "application/pdf"
    );

    // Get signed URL
    const url = await downloadFile(s3Key);

    return NextResponse.json({ url, filename: outputFileName });
  } catch (error: any) {
    console.error("Watermark error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add watermark" },
      { status: 500 }
    );
  }
}

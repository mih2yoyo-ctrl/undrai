
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";
import { uploadFile, downloadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;
    const rotationDegrees = parseInt((formData.get("degrees") as string) || "90");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    // Rotate all pages
    for (const page of pages) {
      page.setRotation(degrees(rotationDegrees));
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const outputFileName = `${Date.now()}-rotated.pdf`;
    const s3Key = await uploadFile(
      Buffer.from(pdfBytes),
      outputFileName,
      "application/pdf"
    );

    // Get signed URL
    const url = await downloadFile(s3Key);

    return NextResponse.json({ url, filename: outputFileName });
  } catch (error: any) {
    console.error("Rotate error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to rotate PDF" },
      { status: 500 }
    );
  }
}

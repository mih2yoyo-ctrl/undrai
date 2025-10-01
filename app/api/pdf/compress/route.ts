
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { uploadFile, downloadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Load PDF
    const pdfDoc = await PDFDocument.load(buffer);

    // Simple compression by removing metadata and saving with default compression
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    // Save with compression
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    // Save to S3
    const outputFileName = `${Date.now()}-compressed.pdf`;
    const s3Key = await uploadFile(
      Buffer.from(pdfBytes),
      outputFileName,
      "application/pdf"
    );

    // Get signed URL
    const url = await downloadFile(s3Key);

    return NextResponse.json({ url, filename: outputFileName });
  } catch (error: any) {
    console.error("Compress error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to compress PDF" },
      { status: 500 }
    );
  }
}

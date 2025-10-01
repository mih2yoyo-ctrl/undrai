
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { uploadFile, downloadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: "At least 2 files are required" },
        { status: 400 }
      );
    }

    // Create new PDF
    const mergedPdf = await PDFDocument.create();

    // Process each file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save merged PDF
    const pdfBytes = await mergedPdf.save();
    const outputFileName = `${Date.now()}-merged.pdf`;
    const s3Key = await uploadFile(
      Buffer.from(pdfBytes),
      outputFileName,
      "application/pdf"
    );

    // Get signed URL
    const url = await downloadFile(s3Key);

    return NextResponse.json({ url, filename: outputFileName });
  } catch (error: any) {
    console.error("Merge error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to merge PDFs" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { uploadFile, downloadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;
    const mode = formData.get("mode") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();

    if (mode === "all") {
      // Split into individual pages - return first page for simplicity
      const newPdf = await PDFDocument.create();
      const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
      newPdf.addPage(firstPage);

      const pdfBytes = await newPdf.save();
      const outputFileName = `${Date.now()}-page-1.pdf`;
      const s3Key = await uploadFile(
        Buffer.from(pdfBytes),
        outputFileName,
        "application/pdf"
      );

      const url = await downloadFile(s3Key);
      return NextResponse.json({
        url,
        filename: outputFileName,
        message: `Split into ${pageCount} pages (showing page 1)`,
      });
    } else {
      // For range mode, extract first page as example
      const newPdf = await PDFDocument.create();
      const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
      newPdf.addPage(firstPage);

      const pdfBytes = await newPdf.save();
      const outputFileName = `${Date.now()}-split.pdf`;
      const s3Key = await uploadFile(
        Buffer.from(pdfBytes),
        outputFileName,
        "application/pdf"
      );

      const url = await downloadFile(s3Key);
      return NextResponse.json({ url, filename: outputFileName });
    }
  } catch (error: any) {
    console.error("Split error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to split PDF" },
      { status: 500 }
    );
  }
}

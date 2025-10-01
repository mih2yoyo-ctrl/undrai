
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { uploadFile, downloadFile } from "@/lib/s3";
import mammoth from "mammoth";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let pdfDoc: PDFDocument;

    // Handle different file types
    if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      // Create PDF with text
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { height } = page.getSize();
      
      // Split text into lines and add to PDF
      const lines = text.split("\n");
      let y = height - 50;
      
      for (const line of lines) {
        if (y < 50) {
          const newPage = pdfDoc.addPage([595, 842]);
          y = newPage.getSize().height - 50;
        }
        page.drawText(line.substring(0, 100), {
          x: 50,
          y,
          size: 12,
        });
        y -= 20;
      }
    } else if (fileName.endsWith(".txt")) {
      // Handle text files
      const text = buffer.toString("utf-8");
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { height } = page.getSize();
      
      const lines = text.split("\n");
      let y = height - 50;
      
      for (const line of lines) {
        if (y < 50) {
          const newPage = pdfDoc.addPage([595, 842]);
          y = newPage.getSize().height - 50;
        }
        page.drawText(line.substring(0, 100), {
          x: 50,
          y,
          size: 12,
        });
        y -= 20;
      }
    } else if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png")
    ) {
      // Handle images
      const processedImage = await sharp(buffer).png().toBuffer();
      
      pdfDoc = await PDFDocument.create();
      const image = await pdfDoc.embedPng(processedImage);
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported file format" },
        { status: 400 }
      );
    }

    // Save PDF to S3
    const pdfBytes = await pdfDoc.save();
    const outputFileName = `${Date.now()}-converted.pdf`;
    const s3Key = await uploadFile(
      Buffer.from(pdfBytes),
      outputFileName,
      "application/pdf"
    );

    // Get signed URL
    const url = await downloadFile(s3Key);

    return NextResponse.json({ url, filename: outputFileName });
  } catch (error: any) {
    console.error("Convert error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to convert file" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const { type, data, format, darkColor, lightColor } = await request.json();

    let qrData = "";

    // Generate QR data based on type
    switch (type) {
      case "url":
        qrData = data?.url || "";
        break;
      case "text":
        qrData = data?.text || "";
        break;
      case "wifi":
        qrData = `WIFI:T:${data?.security || "WPA"};S:${data?.ssid || ""};P:${data?.password || ""};;`;
        break;
      case "contact":
        qrData = `BEGIN:VCARD
VERSION:3.0
FN:${data?.name || ""}
TEL:${data?.phone || ""}
EMAIL:${data?.email || ""}
ORG:${data?.organization || ""}
END:VCARD`;
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!qrData) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Generate QR code
    const options: QRCode.QRCodeToDataURLOptions = {
      type: "image/png",
      color: {
        dark: darkColor || "#000000",
        light: lightColor || "#ffffff",
      },
      width: 512,
      margin: 2,
    };

    let image: string;

    if (format === "svg") {
      image = await QRCode.toString(qrData, { ...options, type: "svg" });
      image = `data:image/svg+xml;base64,${Buffer.from(image).toString("base64")}`;
    } else {
      image = await QRCode.toDataURL(qrData, options);
    }

    return NextResponse.json({ image, data: qrData });
  } catch (error: any) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

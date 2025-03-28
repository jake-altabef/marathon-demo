import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const COLLATE_BUCKET = process.env.BEDROCK_COLLATE_BUCKET!;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pdfName = searchParams.get("fileKey");

  if (!pdfName || typeof pdfName !== "string") {
    return NextResponse.json({ error: "Missing or invalid file key" }, { status: 400 });
  }

  // now that we have the PDF name we must traverse the folder structure to get to the results 
  // the only subfolder that 

  try {
    const command = new GetObjectCommand({ Bucket: COLLATE_BUCKET, Key: fileKey });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}

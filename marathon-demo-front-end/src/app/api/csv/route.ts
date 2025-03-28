import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const COLLATE_BUCKET = process.env.BEDROCK_COLLATE_BUCKET!;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fileKey = searchParams.get("fileKey");

  if (!fileKey || typeof fileKey !== "string") {
    return NextResponse.json({ error: "Missing or invalid file key" }, { status: 400 });
  } 

  try {
    const command = new GetObjectCommand({ Bucket: COLLATE_BUCKET, Key: fileKey });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}

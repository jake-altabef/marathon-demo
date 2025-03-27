import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextApiRequest, NextApiResponse } from "next";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileKey } = req.query; // Get file key from request query

  if (!fileKey || typeof fileKey !== "string") {
    return res.status(400).json({ error: "Missing or invalid file key" });
  }

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
}
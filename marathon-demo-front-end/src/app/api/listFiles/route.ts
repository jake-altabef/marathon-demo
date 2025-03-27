import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const INGEST_BUCKET = process.env.BEDROCK_INGEST_BUCKET!;
const COLLATE_BUCKET = process.env.BEDROCK_COLLATE_BUCKET!;

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Grab list of files that have been uploaded.
    const command = new ListObjectsV2Command({ Bucket: INGEST_BUCKET });
    const { Contents } = await s3.send(command);

    if (!Contents) {
      return res.status(200).json([]);
    }

    // Extract file info from listObjects call
    const ingestedFiles = Contents.map((file) => ({
      key: file.Key!,
      name: file.Key!.split("/").pop()!, 
    }));

    res.status(200).json(ingestedFiles);
    return res;

  } catch (error) {
    console.error("Error listing S3 files:", error);
    // res.status(500).json({ error: "Failed to list S3 files" });
    return NextResponse.error();
  }
}

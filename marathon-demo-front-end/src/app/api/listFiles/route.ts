import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const INGEST_BUCKET = process.env.BEDROCK_INGEST_BUCKET!;
const COLLATE_BUCKET = process.env.BEDROCK_COLLATE_BUCKET!;

export async function GET(req: NextRequest) {  try {
    // Grab list of files that have been uploaded.
    const command = new ListObjectsV2Command({ Bucket: INGEST_BUCKET });
    const { Contents } = await s3.send(command);

    // Process and map the file list
    const ingestedFiles = Contents?.map((file) => ({
      key: file.Key!,
      name: file.Key!.split("/").pop()!,
    })) || [];

    return NextResponse.json(ingestedFiles);

  } catch (err) {
    // Return error response
    console.error("Error listing S3 files:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

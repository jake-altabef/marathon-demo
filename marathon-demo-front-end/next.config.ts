import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AWS_REGION: process.env.REGION,
    AWS_ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    BEDROCK_INGEST_BUCKET: process.env.BEDROCK_INGEST_BUCKET,
    BEDROCK_RESULTS_BUCKET: process.env.BEDROCK_RESULTS_BUCKET,
    BEDROCK_COLLATE_BUCKET: process.env.BEDROCK_COLLATE_BUCKET,
  }
};

export default nextConfig;

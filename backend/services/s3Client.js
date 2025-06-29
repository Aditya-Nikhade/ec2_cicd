import { S3Client } from "@aws-sdk/client-s3";

const s3Options = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Options.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
} else {
  console.warn("[S3] AWS credentials not found in environment – falling back to default credential provider chain.");
}

const s3Client = new S3Client(s3Options);

export default s3Client;

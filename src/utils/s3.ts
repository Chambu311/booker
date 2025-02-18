import AWS from "aws-sdk";
import { env } from "~/env.mjs";

AWS.config.update({
  region: "us-east-1", // or your region
  credentials: new AWS.Credentials({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  }),
});
const s3 = new AWS.S3();

export default s3;

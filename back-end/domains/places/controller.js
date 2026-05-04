import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs, { link } from "fs";
import download from "image-downloader";
import mime from "mime-types";
import multer from "multer";
import { __dirname } from "../../server.js";

const { S3_ACCESS_KEY, S3_SECRET_KEY, BUCKET } = process.env;

const getExtension = (path) => {
  const mimeType = mime.lookup(path);
  const contentType = mime.contentType(mimeType);
  const extension = mime.extension(contentType);

  const destination = `${__dirname}/tmp/`;

  return extension;
};

export const sendtoS3 = async (filename, path, mimetype) => {
  const client = new S3Client({
    region: "eu-north-1",
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
  });
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: filename,
    Body: fs.readFileSync(path),
    ContentType: mimetype,
    //ACL: "public-read",
  });

  try {
    await client.send(command);
    return `https://${BUCKET}.s3.eu-north-1.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("Erro S3:", error);
    throw error;
  }
};

export const downloadImage = async (link) => {
  const destination = `${__dirname}/tmp/`;
  const mimeType = mime.lookup(link); // ← lookup, não contentType
  const contentType = mime.contentType(mimeType);
  let extension = mime.extension(contentType);

  if (!extension) extension = "jpg";

  const filename = `${Date.now()}.${extension}`;
  const fullPath = `${destination}${filename}`;

  try {
    const options = {
      url: link,
      dest: fullPath,
    };
    await download.image(options);
    return { filename, fullPath, mimeType };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const uploadImage = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${__dirname}/tmp/`);
    },
    filename: function (req, file, cb) {
      const extension = getExtension(file.originalname);
      const uniqueSuffix = Math.round(Math.random() * 1e9);
      cb(null, `${Date.now()}-${uniqueSuffix}.${extension}`);
    },
  });

  return multer({ storage });
};

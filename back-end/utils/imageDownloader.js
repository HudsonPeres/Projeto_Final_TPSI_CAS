import download from "image-downloader";
import mime from "mime-types";

export const downloadImage = async (link, destination) => {
  const mimeType = mime.lookup(link);
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
    return filename;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

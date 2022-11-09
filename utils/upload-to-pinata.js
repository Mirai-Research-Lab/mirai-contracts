const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");

const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataApiSecret = process.env.PINATA_API_SECRET || "";
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

pinata
  .testAuthentication()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];
  for (fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    console.log(`Uploading reading ${files[fileIndex]}...`);
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile, {
        pinataMetadata: {
          name: files[fileIndex],
        },
      });
      responses.push(response);
    } catch (error) {
      console.log(error);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { storeImages, storeTokenUriMetadata };

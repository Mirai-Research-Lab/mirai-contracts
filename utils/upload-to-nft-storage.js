const { NFTStorage, File } = require("nft.storage");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.NFT_STORAGE_API_KEY || "";
const client = new NFTStorage({ token: API_KEY });
const IMAGES_PATH = "../images";

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];

  for (fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    console.log(`Uploading ${files[fileIndex]}...`);
    try {
      const response = await client.store({
        name: files[fileIndex],
        image: new File([readableStreamForFile], files[fileIndex], {
          type: "image/png",
        }),
        description: "This is a cool NFT",
        attributes: {
          strength: Math.floor(Math.random() * 30) + 70,
          rarity: Math.floor(Math.random() * 30) + 70,
          grade: Math.floor(Math.random() * 30) + 70,
          efficiency: Math.floor(Math.random() * 30) + 70,
          fire_rate: Math.floor(Math.random() * 30) + 70,
          mobility: Math.floor(Math.random() * 30) + 70,
          capacity: Math.floor(Math.random() * 30) + 70,
        },
      });
      responses.push(response.url);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  return { responses, files };
}

storeImages(IMAGES_PATH).then((responses, files) => {
  console.log(responses);
});

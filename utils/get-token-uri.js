const { storeImages, storeTokenUriMetadata } = require("./upload-to-pinata");

const imagesPath = "./images/";
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Coolness",
      value: 100,
    },
    {
      trait_type: "Rarity",
      value: 100,
    },
    {
      trait_type: "Power",
      value: 100,
    },
  ],
};

async function handleTokenUris() {
  const { responses, files } = await storeImages(imagesPath);
  const tokenUris = [];

  for (responseIndex in responses) {
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name =
      files[responseIndex].replace(".webp", "") || "Another cool NFT";
    tokenUriMetadata.description = `${tokenUriMetadata.name} is a cool NFT`;
    tokenUriMetadata.image = `ipfs://${responses[responseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const uploadedMetadataResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUris.push(`ipfs://${uploadedMetadataResponse.IpfsHash}`);
  }
  console.log("Token URIs are uploaded!");
  console.log(tokenUris);

  return tokenUris;
}

handleTokenUris()
  .then((tokenUris) => {
    console.log(tokenUris);
  })
  .catch((error) => {
    console.log(error);
  });

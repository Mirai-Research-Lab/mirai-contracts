const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_AMOUNT = "20";

async function buyToken() {
  const nftMarketplace = await ethers.getContract("Marketplace");
  const [player] = await ethers.getSigners();

  const tx = await nftMarketplace.buyToken(player, {
    value: ethers.utils.parseEther(TOKEN_AMOUNT),
  });
  await tx.wait(1);

  console.log(TOKEN_AMOUNT, " Mirai tokens sent to ", player);
  if (network.config.chainId == "31337") {
    await moveBlocks(2, (sleepAmount = 1000));
  }
}

buyToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

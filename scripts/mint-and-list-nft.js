const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.01");

async function mintAndList() {
  const nftMarketplace = await ethers.getContractAt(
    "Marketplace",
    "0x0f5bb242f5F060eE2B5ba1a0f129d5c04A07a454"
  );
  let VRFCoordinatorV2Mock;
  if (network.config.chainId == 31337)
    VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  const IpfsNft = await ethers.getContractAt(
    "IpfsNFT",
    "0x7CcD0efe93F18ABC3c9C8b394409426528409954"
  );
  console.log("Minting NFT...");
  const mintTx = await IpfsNft.requestNft({ gasLimit: 100000 });
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[1].args[0].toString();

  if (network.config.chainId == 31337) {
    await VRFCoordinatorV2Mock.fulfillRandomWords(
      mintTxReceipt.events[1].args[2],
      IpfsNft.address
    );
  }
  console.log("Approving NFT...");
  const approvalTx = await IpfsNft.approve(nftMarketplace.address, tokenId, {
    gasLimit: 100000,
  });
  await approvalTx.wait(1);

  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(IpfsNft.address, tokenId, PRICE);
  await tx.wait(1);
  console.log("NFT Listed!");

  if (network.config.chainId == 31337) {
    await moveBlocks(1, (sleepAmount = 1000));
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

async function mint() {
  const IpfsNft = await ethers.getContract("IpfsNft");
  console.log("Minting NFT...");
  const mintTx = await IpfsNft.requestNft();
  const mintTxReceipt = await mintTx.wait(1);

  console.log(
    `Minted NFT ${mintTxReceipt.events[0].args} from contract: ${IpfsNft.address}`
  );
  if (network.config.chainId == 31337) {
    await moveBlocks(2, (sleepAmount = 1000));
  }
}

mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const { ethers, network } = require("hardhat")
const { moveBlocks, sleep } = require("../utils/move-blocks")
async function main() {
  const nftContract = await ethers.getContract("DefaultNFT")
  const marketplaceContract = await ethers.getContract("Marketplace")
  console.log("----Minting----")
  const mintTx = await nftContract.mintNft()
  const mintReceipt = await mintTx.wait(1)
  console.log(mintReceipt.events[0].args)
  const tokenId = mintReceipt.events[0].args.tokenId
  console.log(`The minted TokenID is ${tokenId}`)
  console.log(`The nftAddress is ${nftContract.address}`)
  console.log("----Successfully Minted----")
  if (network.config.chainId === 31337) {
    await moveBlocks(2, (sleepAmount = 1000))
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })

const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", function () {
      let nftMarketplace, nftMarketplaceContract, IpfsNft, VRFCoordinatorV2Mock;
      const PRICE = ethers.utils.parseEther("0.1");
      let tokenId;

      beforeEach(async () => {
        accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("Marketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        IpfsNft = await ethers.getContract("IpfsNFT", deployer);
        VRFCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );

        const requestTx = await IpfsNft.requestNft();
        const reqeustReciept = await requestTx.wait(1);
        await VRFCoordinatorV2Mock.fulfillRandomWords(
          reqeustReciept.events[1].args[2],
          IpfsNft.address
        );
        tokenId = reqeustReciept.events[1].args[0];

        const approvalTx = await IpfsNft.approve(
          nftMarketplace.address,
          tokenId,
          {
            gasLimit: 1000000,
          }
        );
        await approvalTx.wait(1);
      });

      describe("listItem", function () {
        it("price should be above zero", async function () {
          await expect(
            nftMarketplace.listItem(IpfsNft.address, tokenId, "0")
          ).to.be.revertedWith("Marketplace__PriceShouldBeAboveZero");
        });

        it("emits an event after listing an item", async function () {
          expect(
            await nftMarketplace.listItem(IpfsNft.address, tokenId, "10")
          ).to.emit("ItemAdded");
        });
      });

      describe("updateItem", function (){
        it("Updates listing with seller and price", async function () {
          const newPrice = "10000";
          await nftMarketplace.listItem(IpfsNft.address, tokenId, "1");

          expect(
            await nftMarketplace.updateItem(IpfsNft.address, tokenId, newPrice)
          ).to.emit("ItemAdded");
        });
      })

      describe("cancelListing", function () {
        it("reverts if there is no listing", async function () {
          await expect(
            nftMarketplace.cancelItem(IpfsNft.address, tokenId)
          ).to.be.revertedWith("Marketplace__NotListed");
        });

        it("reverts if anyone but the owner tries to call", async function () {
          await nftMarketplace.listItem(IpfsNft.address, tokenId, PRICE);

          nftMarketplace = nftMarketplaceContract.connect(user);
          await IpfsNft.approve(user.address, tokenId);
          await expect(
            nftMarketplace.cancelItem(IpfsNft.address, tokenId)
          ).to.be.revertedWith("Marketplace__NotOwnerOfNFT");
        });

        it("emits event and removes listing", async function () {
          await nftMarketplace.listItem(IpfsNft.address, tokenId, PRICE);
          expect(
            await nftMarketplace.cancelItem(IpfsNft.address, tokenId)
          ).to.emit("ItemCancelled");
        });
      });

      describe("buyItem", function () {
        it("reverts if the item isnt listed", async function () {
          await expect(
            nftMarketplace.buyItem(IpfsNft.address, tokenId)
          ).to.be.revertedWith("Marketplace__NotListed");
        });

        it("reverts if the price isnt met", async function () {
          await nftMarketplace.listItem(IpfsNft.address, tokenId, PRICE);
          await expect(
            nftMarketplace.buyItem(IpfsNft.address, tokenId)
          ).to.be.revertedWith("Marketplace__NotSentEnoughEth");
        });

        it("transfers the nft to the buyer and updates internal proceeds record", async function () {
          await nftMarketplace.listItem(IpfsNft.address, tokenId, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          expect(
            await nftMarketplace.buyItem(IpfsNft.address, tokenId, {
              value: PRICE,
            })
          ).to.emit("ItemBought");
        });
      });
    });

const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", function () {
      let nftMarketplace, nftMarketplaceContract, IpfsNft, IpfsNftContract;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = "0";

      beforeEach(async () => {
        accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("Marketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        IpfsNftContract = await ethers.getContract("IpfsNFT");
        IpfsNft = IpfsNftContract.connect(deployer);
      });

      describe("listItem", function () {
        it("emits an event after listing an item", async function () {
          const nftTx = await IpfsNft.requestNft();
          await nftTx.wait(1);

          expect(
            await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE)
          ).to.emit("ItemAdded");
        });

        it("price should be above zero", async function () {
          console.log("lol");
          await expect(
            nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, -1)
          ).to.be.revertedWith("Marketplace__PriceShouldBeAboveZero");
        });
        it("exclusively allows owners to list", async function () {
          nftMarketplace = nftMarketplaceContract.connect(user);
          await IpfsNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotOwner");
        });
        it("needs approvals to list item", async function () {
          await IpfsNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("Marketplace__NotAppoved()");
        });
        it("Updates listing with seller and price", async function () {
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          const listing = await nftMarketplace.getListing(
            IpfsNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == deployer.address);
        });
      });
      describe("cancelListing", function () {
        it("reverts if there is no listing", async function () {
          const error = `NotListed("${IpfsNft.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketplace.cancelListing(IpfsNft.address, TOKEN_ID)
          ).to.be.revertedWith(error);
        });
        it("reverts if anyone but the owner tries to call", async function () {
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await IpfsNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketplace.cancelListing(IpfsNft.address, TOKEN_ID)
          ).to.be.revertedWith("NotOwner");
        });
        it("emits event and removes listing", async function () {
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketplace.cancelListing(IpfsNft.address, TOKEN_ID)
          ).to.emit("ItemCanceled");
          const listing = await nftMarketplace.getListing(
            IpfsNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == "0");
        });
      });
      describe("buyItem", function () {
        it("reverts if the item isnt listed", async function () {
          await expect(
            nftMarketplace.buyItem(IpfsNft.address, TOKEN_ID)
          ).to.be.revertedWith("NotListed");
        });
        it("reverts if the price isnt met", async function () {
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          await expect(
            nftMarketplace.buyItem(IpfsNft.address, TOKEN_ID)
          ).to.be.revertedWith("PriceNotMet");
        });
        it("transfers the nft to the buyer and updates internal proceeds record", async function () {
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          expect(
            await nftMarketplace.buyItem(IpfsNft.address, TOKEN_ID, {
              value: PRICE,
            })
          ).to.emit("ItemBought");
          const newOwner = await IpfsNft.ownerOf(TOKEN_ID);
          const deployerProceeds = await nftMarketplace.getProceeds(
            deployer.address
          );
          assert(newOwner.toString() == user.address);
          assert(deployerProceeds.toString() == PRICE.toString());
        });
      });
      describe("updateListing", function () {
        it("must be owner and listed", async function () {
          await expect(
            nftMarketplace.updateListing(IpfsNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotListed");
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.updateListing(IpfsNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotOwner");
        });
        it("updates the price of the item", async function () {
          const updatedPrice = ethers.utils.parseEther("0.2");
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketplace.updateListing(
              IpfsNft.address,
              TOKEN_ID,
              updatedPrice
            )
          ).to.emit("ItemListed");
          const listing = await nftMarketplace.getListing(
            IpfsNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == updatedPrice.toString());
        });
      });
      describe("withdrawProceeds", function () {
        it("doesn't allow 0 proceed withdrawls", async function () {
          await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
            "NoProceeds"
          );
        });
        it("withdraws proceeds", async function () {
          await nftMarketplace.listItem(IpfsNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await nftMarketplace.buyItem(IpfsNft.address, TOKEN_ID, {
            value: PRICE,
          });
          nftMarketplace = nftMarketplaceContract.connect(deployer);

          const deployerProceedsBefore = await nftMarketplace.getProceeds(
            deployer.address
          );
          const deployerBalanceBefore = await deployer.getBalance();
          const txResponse = await nftMarketplace.withdrawProceeds();
          const transactionReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const deployerBalanceAfter = await deployer.getBalance();
          assert(
            deployerBalanceAfter.add(gasCost).toString() ==
              deployerProceedsBefore.add(deployerBalanceBefore).toString()
          );
        });
      });
    });

const { assert, expect } = require("chai");
const { BigNumber } = require("ethers");
const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  TOKEN_AMOUNT_GIVEN_TO_PLAYER,
  TOKEN_NEEDED_TO_PLAY,
  DECIMALS,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Game Unit Tests", function () {
      let gameContract,
        IpfsNft,
        IpfsNftContract,
        MIRAI_PER_ETH,
        player1,
        player2,
        pl;
      const PRICE = ethers.utils.parseEther("1");
      const TOKEN_ID = 0;
      const ETH = "1";
      const TOKEN_DECIMALS = 10 ** DECIMALS;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        await deployments.fixture(["all"]);

        gameContract = await ethers.getContract("GameContract");
        game = gameContract.connect(deployer);
        MIRAI_PER_ETH = await game.getConversion(ETH);

        IpfsNftContract = await ethers.getContract("IpfsNFT");
        IpfsNft = IpfsNftContract.connect(deployer);

        const nftTx = await IpfsNft.requestNft();
        const nftReceipt = await nftTx.wait(1);
      });

      describe("buyToken", function () {
        it("price should be above zero", async function () {
          const TOKEN_TO_BUY = "0";
          await expect(
            game.buyToken(user.address, { value: TOKEN_TO_BUY })
          ).to.be.revertedWith("GameContract__NoEthSent");
        });

        it("should buy token", async function () {
          const TOKEN_TO_BUY = "1";

          expect(
            await game.buyToken(user.address, { value: TOKEN_TO_BUY })
          ).to.emit("TokenBought");
        });

        it("should update token balance", async function () {
          const TOKEN_TO_BUY = "1";
          const buyTx = await game.buyToken(user.address, {
            value: TOKEN_TO_BUY,
          });
          const buyReceipt = await buyTx.wait(1);
          assert(balance == TOKEN_TO_BUY * MIRAI_PER_ETH * TOKEN_DECIMALS);
        });
      });

      describe("playGame", function () {
        it("should play game", async function () {});
      });

      describe("getter functions ", function () {
        it("returns player info", async function () {
          const playerInfo = await game.getPlayerInfo(user.address);
          assert.equal(playerInfo[0], 0);
          assert.equal(playerInfo[1], 0);
        });

        it("returns token needed to play", async function () {
          const tokenNeeded = await game.getTokenNeededToPlay();
          assert.equal(
            tokenNeeded.toString(),
            TOKEN_NEEDED_TO_PLAY * TOKEN_DECIMALS
          );
        });

        it("return total number of players participating", async function () {
          const totalPlayers = await game.getNumberOfPlayers();
          assert.equal(totalPlayers, 0);
        });

        it("returns correct initial token supply", async function () {
          const tokenSupply = await game.getInitialTokenGiven();
          assert.equal(
            tokenSupply.toString(),
            TOKEN_AMOUNT_GIVEN_TO_PLAYER * TOKEN_DECIMALS
          );
        });
      });
    });

// Total Token Supply : 100000000000000000000000000000000000000
// Tokens in 1 eth    : 100000000000000000000

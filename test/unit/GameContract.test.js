const { assert, expect } = require("chai");
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
        player3;

      const ETH = ethers.utils.parseEther("0.00000000001");
      const TOKEN_DECIMALS = 10 ** DECIMALS;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        [deployer, user, player1, player2, player3] = accounts;

        await deployments.fixture(["all"]);

        gameContract = await ethers.getContract("GameContract");
        game = gameContract.connect(deployer);
        MIRAI_PER_ETH = await game.getConversion(ETH);

        IpfsNftContract = await ethers.getContract("IpfsNFT");
        IpfsNft = IpfsNftContract.connect(deployer);

        const nftTx = await IpfsNft.requestNft();
        const nftReceipt = await nftTx.wait(1);
      });
      describe("signIn", function () {
        it("should distribute token on first sign in", async function () {
          const oldTokenBalance = await game.getTokenOf(player1.address);
          console.log(
            "TokenBalance Before Siging in",
            oldTokenBalance.toString()
          );
          const tx = await game.signIn(player1.address);
          const txReciept = await tx.wait(1);
          const newTokenBalance = await game.getTokenOf(player1.address);
          console.log(
            "Token Balance After Siging in",
            newTokenBalance.toString()
          );

          assert.notEqual(
            newTokenBalance.toString(),
            oldTokenBalance.toString()
          );
        });
      });
      describe("buyToken", function () {
        it("price should be above zero", async function () {
          const TOKEN_TO_BUY = ethers.utils.parseEther("0");
          console.log((await game.getTokenOf(game.address)).toString());
          await expect(
            game.buyToken(user.address, { value: TOKEN_TO_BUY })
          ).to.be.revertedWith("GameContract__NoEthSent");
        });

        it("should buy token", async function () {
          const TOKEN_TO_BUY = ethers.utils.parseEther("0.000000000000001");

          expect(
            await game.buyToken(user.address, { value: TOKEN_TO_BUY })
          ).to.emit("TokenBought");
        });

        it("should update token balance", async function () {
          const TOKEN_TO_BUY = ethers.utils.parseEther("0.00000000000001");
          const buyTx = await game.buyToken(user.address, {
            value: TOKEN_TO_BUY,
          });
          const buyReceipt = await buyTx.wait(1);
          const balance = await game.getTokenOf(user.address);

          // assert(balance == TOKEN_TO_BUY * TOKEN_DECIMALS);
        });
      });
      describe("burn", function () {
        it("should burn token when played", async function () {
          await game.signIn(player1.address);
          const tokenBalanceBefore = await game.getTokenOf(player1.address);
          console.log("Token Balance Before", tokenBalanceBefore.toString());
          const tx = await game.burn(player1.address);
          const txReceipt = await tx.wait(1);
          const tokenBalanceAfter = await game.getTokenOf(player1.address);
          console.log("Token Balance After", tokenBalanceAfter.toString());
          assert.notEqual(
            tokenBalanceBefore.toString(),
            tokenBalanceAfter.toString()
          );
        });
      });
      describe("playGame", function () {
        it("should play game", async function () {
          await game.signIn(player1.address);
          await game.signIn(player2.address);
          await game.signIn(player3.address);

          expect(
            await game.distributeToken(
              player1.address,
              player2.address,
              player3.address
            )
          ).to.emit("WinnersPaid");
        });

        it("gives correct amount to winners", async function () {
          await game.signIn(player1.address);
          await game.signIn(player2.address);
          await game.signIn(player3.address);

          // transfer 50 eth to game contract
          await game.buyToken(deployer.address, {
            value: ethers.utils.parseEther("0.000000000000005"),
          });

          const gameContractBalance = await ethers.provider.getBalance(
            gameContract.address
          );

          const tokenBalanceBefore = await ethers.provider
            .getBalance(player1.address)
            .toString();

          const ownerBalanceBefore = (
            await ethers.provider.getBalance(deployer.address)
          ).toString();

          const tx = await game.distributeToken(
            player1.address,
            player2.address,
            player3.address
          );
          const receipt = await tx.wait(1);

          const tokenBalanceAfter = (
            await ethers.provider.getBalance(player1.address)
          ).toString();
          const ownerBalanceAfter = (
            await ethers.provider.getBalance(deployer.address)
          ).toString();

          console.log(
            "player1 balance before",
            tokenBalanceBefore,
            "\nafter",
            tokenBalanceAfter
          );

          console.log(
            "owner balance before",
            ownerBalanceBefore,
            "\nafter",
            ownerBalanceAfter
          );

          assert.notEqual(
            tokenBalanceAfter.toString(),
            tokenBalanceBefore.toString()
          );
        });
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

      describe("Donations", () => {
        it("emits event on donation", async () => {
          expect(await game.fundContract({ value: ETH })).to.emit(
            "DonationReceived"
          );
        });
      });
    });

// Total Token Supply : 100000000000000000000000000000000000000
// Tokens in 1 eth    : 100000000000000000000

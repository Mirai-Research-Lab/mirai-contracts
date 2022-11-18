### This repo contains the codebase for the Smart contracts of our Mirai Shooter Game, the ERC20 token and the ERC721 NFTs, and the marketplace for the NFTs.

---

### The contracts are deployed on the Ethereum Goerli testnet and the Polygon Mumbai testnet.

---

### To deploy and run the contract functions locally:

1. Run command: `git clone https://github.com/Mirai-Research-Lab/mirai-contracts.git`
2. Run command: `cd mirai-contracts`
3. Run command: `yarn`
4. To run a local node run: `yarn hardhat node`
5. For running the tests: `yarn hardhat test --network localhost`
6. To mint a NFT run: `yarn hardhat run ./scripts/mint-nft.js --network localhost`
7. To mint a NFT and list it on the marketplace run: `yarn hardhat run ./scripts/mint-and-list-nft.js --network localhost`

---

## CONTRACTS :

### Mirai ERC20 Token:

- Mirai (MRI) ERC20 Token with a total supply of 1,000,000 tokens.

### ERC721 NFTs:

- Total 32 unique NFTs with 7 attributes - rarity, grade, efficiency, fire_rate, mobility, capacity, strength.

### NFT Marketplace:

- NFTs can be listed and bought on the marketplace.

### Game Contract:

- The game contract is responsible for the game logic and the game state.

const { moveBlocks, sleep } = require("add the correct path to move-blocks.js")
const BLOCKS = 2
const SLEEP_TIME = 1500

async function main() {
  await moveBlocks(BLOCKS, (sleepAmount = SLEEP_TIME))
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })

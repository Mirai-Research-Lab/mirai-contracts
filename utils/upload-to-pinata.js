const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()
const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET

const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesFilePath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesFilePath)
    let responses = []
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesFilePath}/${files[fileIndex]}`
        )
        console.log("----Uploading To IPFS----")
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (e) {
            console.log(e)
        }
    }

    return { files, responses }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log(e)
    }
    return null
}
module.exports = { storeImages, storeTokenUriMetadata }

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNFT is ERC721 {
    /**
     * 1. mint logic
     * 2. store logic
     * 3. logic to change image based on some condition
     */
    uint256 private s_tokenCounter;
    //A mapping between tokenId and highValue, highValue is based on which we will say the value is too high for the token
    mapping(uint256 => int256) s_tokenIdToHighValue;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    string private s_happyImageUri;
    string private s_sadImageUri;
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    /**
     * SVGs are coded in HTML using svg tags, we will pass that html itself in constructor
     * Then let our contract convert them into image uris
     * We will convert SVGs into Base64 image uris
     */
    constructor(
        address priceFeedAddress,
        string memory sadSvg,
        string memory happySvg
    ) ERC721("Mobi Dynamic SVG", "MDS") {
        s_tokenCounter = 0;
        s_happyImageUri = svgToImageUri(happySvg);
        s_sadImageUri = svgToImageUri(sadSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageUri(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    /*We will based which imageUri to use based on the price of ethereum obtained from chainlink pricefeeds, if it's high, then
    sad one else the happy one*/
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for non-existent token is not possible!");
        string memory imageUri = s_happyImageUri;
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageUri = s_sadImageUri;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '"name":"',
                                name(),
                                '","description": "An NFT that changes based on chainlink feed","attributes":[{"trait_type":"cool","value":"100"}],"image":"',
                                imageUri,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function mintNft(int256 highValue) public {
        //When users mint the NFTs they will set the highValue for that particular NFT.
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedNFT(s_tokenCounter, highValue);
    }
}

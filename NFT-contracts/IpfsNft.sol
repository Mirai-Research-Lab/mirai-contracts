// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//onlyOwner Modifier is built in @openzeppelin
import "@openzeppelin/contracts/access/Ownable.sol";

contract IpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //Declaration Errors
    error IpfsNFT__RangeOutOfBounds();
    error IpfsNFT__NeedMoreEthSent();
    error IpfsNFT__TransferFailed();
    //Type Declaration
    enum Rarity {
        MOBI,
        KEQI,
        BRONI
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 1;
    uint32 private constant NUM_WORDS = 1;
    uint256 internal immutable i_mintFee;
    bool private s_isinitialized = false;
    //A list of dog token uris
    string[] internal s_charTokenURIs;

    //VRF helpers
    mapping(uint256 => address) private s_requestIdToOwner;

    //NFT Helpers
    uint256 private s_tokenCounter;
    uint8 private constant MAX_CHANCE_VALUE = 60;

    //Events
    event Nft_Requested(uint256 indexed requestId, address requester);

    event Nft_Minted(Rarity rareChar, address minter);

    constructor(
        address vrfCoordinatorV2Address,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory charTokenURIs,
        uint256 mintFee
    )
        VRFConsumerBaseV2(vrfCoordinatorV2Address)
        ERC721("MobiRandomNFT", "MRN")
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2Address);
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_gasLane = gasLane;
        s_tokenCounter = 0;
        s_charTokenURIs = charTokenURIs;
        i_mintFee = mintFee;
        s_isinitialized = true;
    }

    function getInitialized() public view returns (bool) {
        return s_isinitialized;
    }

    function requestNft(address player)
        public
        payable
        returns (uint256 requestId)
    {
        // if (msg.value < i_mintFee) {
        //     revert IpfsNFT__NeedMoreEthSent();
        // }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToOwner[requestId] = player;
        emit Nft_Requested(requestId, player);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address charOwner = s_requestIdToOwner[requestId];
        uint256 newTokenId = s_tokenCounter;
        //get moddedRandom Number to get a random NFT
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Rarity rareChar = getCharFromModdedRng(moddedRng);
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(charOwner, newTokenId);
        _setTokenURI(
            newTokenId,
            s_charTokenURIs[uint256(rareChar)] /*that breed's token URI*/
        );
        emit Nft_Minted(rareChar, charOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert IpfsNFT__TransferFailed();
        }
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        uint256[3] memory chanceArray;
        chanceArray[0] = uint256(10);
        chanceArray[1] = uint256(30);
        chanceArray[2] = uint256(60);
        return chanceArray;
    }

    function getCharFromModdedRng(uint256 moddedRng)
        public
        pure
        returns (Rarity)
    {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            //First checking if between 0 or 10, then 10 or 40 and finally 40 or 100
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArray[i]
            ) {
                return Rarity(i);
            }
            cumulativeSum = cumulativeSum + chanceArray[i];
        }
        revert IpfsNFT__RangeOutOfBounds();
    }

    //Don't need it since we are using _setTokenURI()
    // function tokenURI(uint256) public view override returns (string memory) {}

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getTokenUris(uint256 index) public view returns (string memory) {
        return s_charTokenURIs[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}

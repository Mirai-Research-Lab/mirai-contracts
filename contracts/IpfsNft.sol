// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //Declaration Errors
    error IpfsNFT__RangeOutOfBounds();
    error IpfsNFT__NeedMoreEthSent();
    error IpfsNFT__TransferFailed();
    //Type Declaration

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private immutable i_maxNFT;
    uint16 private constant REQUEST_CONFIRMATIONS = 1;
    uint32 private constant NUM_WORDS = 1;
    uint256 private s_moddedRng;
    bool private s_isinitialized = false;
    string[] internal s_TokenURIs;

    //VRF helpers
    mapping(uint256 => address) private s_requestIdToOwner;

    //NFT Helpers
    uint256 private s_tokenCounter;

    //Events
    event Nft_Requested(
        uint256 indexed tokenId,
        address indexed requester,
        uint256 indexed requestId
    );

    event Nft_Minted(address indexed minter);

    constructor(
        address vrfCoordinatorV2Address,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint16 maxNFT,
        string[3] memory charTokenURIs
    )
        VRFConsumerBaseV2(vrfCoordinatorV2Address)
        ERC721("MobiRandomNFT", "MRN")
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2Address);
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_gasLane = gasLane;
        i_maxNFT = maxNFT;
        s_tokenCounter = 0;
        s_TokenURIs = charTokenURIs;
        s_isinitialized = true;
    }

    function getInitialized() public view returns (bool) {
        return s_isinitialized;
    }

    function requestNft() public returns (uint256 requestId) {
        uint256 tokenId = s_tokenCounter;
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToOwner[requestId] = msg.sender;
        emit Nft_Requested(tokenId, msg.sender, requestId);
    }

    function staticMint() internal {
        uint256 tokenId = s_tokenCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, s_TokenURIs[0]);
        s_tokenCounter++;
        // emit Nft_Requested(tokenId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address charOwner = s_requestIdToOwner[requestId];
        uint256 newTokenId = s_tokenCounter;
        // get moddedRandom Number to get a random NFT
        s_moddedRng = randomWords[0] % i_maxNFT;
        _safeMint(charOwner, newTokenId);
        _setTokenURI(newTokenId, s_TokenURIs[uint256(s_moddedRng)]);
        s_tokenCounter = s_tokenCounter + 1;
        emit Nft_Minted(charOwner);
    }

    function getTokenUris(uint256 index) public view returns (string memory) {
        return s_TokenURIs[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getLastRange() public view returns (uint256) {
        return s_moddedRng;
    }
}

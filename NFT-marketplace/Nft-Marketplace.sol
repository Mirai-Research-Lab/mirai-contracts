//SPDX-License-Identifier:MIT
pragma solidity ^0.8.5;

/* Things Needed:
1. listitem
2. make functionality to buyitem and cancelitem
3. updateitem such as price
4. withdraw money for my sold NFTs
*/

/*Imports*/
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    //Custom Type
    struct Listing {
        uint256 price;
        address seller;
    }
    //Declared Events
    event ItemAdded(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event BoughtItem(
        address indexed nftAddres,
        address indexed buyer,
        address seller,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    //State Properties
    //nftContractAddress -> TokenID -> (price and currentSellerAddress)
    mapping(address => mapping(uint256 => Listing)) private s_itemlist;
    //sellerAddress -> AmountEarned
    mapping(address => uint256) private s_sellerToMoney;

    // Declared Errors
    error Marketplace__NotSentEnoughEth(uint256 sentValue, uint256 price);
    error Marketplace__PriceShouldBeAboveZero();
    error Marketplace__NotAppoved();
    error Marketplace__AlreadyListed(address nftAddress, uint256 tokenId);
    error Marketplace__NotOwnerOfNFT();
    error Marketplace__NotListed();
    error Marketplace__NoAmountToWithdraw();
    error Marketplace__AmountTransferFailed(address withdrawer);
    //Modifiers
    //it throws error if the nft is already listed and reverts back
    modifier alreadyListed(
        address nftAddres,
        uint256 tokenId,
        address owner
    ) {
        Listing memory item = s_itemlist[nftAddres][tokenId];
        if (item.price > 0) {
            revert Marketplace__AlreadyListed(nftAddres, tokenId);
        }
        _;
    }
    //checks to see if the owner of nft is accessing
    modifier onlyOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 obtainedNft = IERC721(nftAddress);
        address owner = obtainedNft.ownerOf(tokenId);
        if (spender != owner) {
            revert Marketplace__NotOwnerOfNFT();
        }
        _;
    }
    //checks if the nft is actually listed, if not then throw error
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory item = s_itemlist[nftAddress][tokenId];
        if (item.price <= 0) {
            revert Marketplace__NotListed();
        }
        _;
    }

    //Contract Functions For Marketplace Functionality
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        alreadyListed(nftAddress, tokenId, msg.sender)
        onlyOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert Marketplace__PriceShouldBeAboveZero();
        }
        IERC721 obtainedNftFromAddress = IERC721(nftAddress);
        if (obtainedNftFromAddress.getApproved(tokenId) != address(this)) {
            revert Marketplace__NotAppoved();
        }
        s_itemlist[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemAdded(nftAddress, tokenId, price, msg.sender);
    }

    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory item = s_itemlist[nftAddress][tokenId];
        if (msg.value < item.price) {
            revert Marketplace__NotSentEnoughEth(msg.value, item.price);
        }
        //Add the money to seller's account
        s_sellerToMoney[item.seller] = s_sellerToMoney[item.seller] + msg.value;
        //delete the listed item
        delete (s_itemlist[nftAddress][tokenId]);

        //Transfer the ownership of NFT from seller to buyer (msg.sender)
        IERC721(nftAddress).safeTransferFrom(item.seller, msg.sender, tokenId);
        emit BoughtItem(
            nftAddress,
            msg.sender,
            item.seller,
            tokenId,
            item.price
        );
    }

    function cancelItem(address nftAddress, uint256 tokenId)
        external
        onlyOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete s_itemlist[nftAddress][tokenId];
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateItem(
        address nftAddress,
        uint256 tokenId,
        uint256 updatedPrice
    )
        external
        onlyOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        s_itemlist[nftAddress][tokenId].price = updatedPrice;
        emit ItemAdded(nftAddress, tokenId, updatedPrice, msg.sender);
    }

    function withdrawAmount() external {
        uint256 amount = s_sellerToMoney[msg.sender];
        if (amount <= 0) {
            revert Marketplace__NoAmountToWithdraw();
        }
        s_sellerToMoney[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert Marketplace__AmountTransferFailed(msg.sender);
        }
    }

    //Getter Functions
    function getListingInfo(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory listing)
    {
        return s_itemlist[nftAddress][tokenId];
    }

    function getAmountOwned(address seller)
        external
        view
        returns (uint256 amount)
    {
        return s_sellerToMoney[seller];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MiraiToken.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConvertor.sol";

contract GameContract {
    using PriceConverter for uint256;
    // Structs
    struct PlayerInfo {
        uint256 id;
        uint256 tokenAmount;
    }
    //Constants
    uint256 constant DECIMALS = 1000000000000000000;
    // Variables
    address private s_owner;
    uint256 private s_numberOfPlayers;
    mapping(address => PlayerInfo) private s_addressToToken;
    MiraiToken private s_token;
    uint256 immutable i_initialTokenGivenToPlayers;
    uint256 immutable i_initialTokenSupply;
    uint256 immutable i_tokenNeededToPlay;
    AggregatorV3Interface internal s_priceFeed;
    // Events
    event PlayerSigned(address indexed sender);
    event GameStarted(address indexed sender, uint256 indexed remainingToken);
    event TokenBought(
        address indexed sender,
        uint256 indexed tokenAmountBought
    );
    event WinnersPaid(address[] indexed winners, uint256[] indexed prizes);
    // Errors
    error GameContract__PlayerAlreadyExists();
    error GameContract__NotEnoughTokens();
    error GameContract__AmountTransferFailed();
    error GameContract__NoEthSent();
    modifier onlyOwner() {
        require(msg.sender == s_owner, "You are not the owner");
        _;
    }

    constructor(
        uint256 initialTokenGivenToPlayers,
        uint256 tokenNeededToPlay,
        uint256 initialTokenSupply,
        address priceFeed
    ) {
        s_owner = msg.sender;
        i_initialTokenSupply = initialTokenSupply * DECIMALS;
        i_initialTokenGivenToPlayers = initialTokenGivenToPlayers * DECIMALS;
        i_tokenNeededToPlay = tokenNeededToPlay * DECIMALS;
        s_priceFeed = AggregatorV3Interface(priceFeed);
        s_numberOfPlayers = 0;
        s_token = new MiraiToken(i_initialTokenSupply);
    }

    // Main functions
    function signIn() public {
        if (s_addressToToken[msg.sender].id > 0) {
            revert GameContract__PlayerAlreadyExists();
        }
        s_token.approve(address(this), 20 * DECIMALS);
        s_token.transferFrom(address(this), msg.sender, 20 * DECIMALS);
        s_addressToToken[msg.sender].tokenAmount = 20 * DECIMALS;
        s_addressToToken[msg.sender].id = 1;
        s_numberOfPlayers = s_numberOfPlayers + 1;
        emit PlayerSigned(msg.sender);
    }

    function burn() public returns (uint256 isApproved) {
        if (s_token.balanceOf(msg.sender) < i_tokenNeededToPlay) {
            return 0;
        }
        s_token.transferFrom(address(this), s_owner, i_tokenNeededToPlay);
        s_addressToToken[msg.sender].tokenAmount =
            s_addressToToken[msg.sender].tokenAmount -
            i_tokenNeededToPlay;
        emit GameStarted(msg.sender, s_addressToToken[msg.sender].tokenAmount);
        return 1;
    }

    function buyToken() public payable {
        uint256 tokenToTransfer = msg.value.getConversionRate(s_priceFeed);
        if (tokenToTransfer == 0) {
            revert GameContract__NoEthSent();
        }
        s_token.approve(address(this), tokenToTransfer * DECIMALS);
        s_token.transferFrom(
            address(this),
            msg.sender,
            tokenToTransfer * DECIMALS
        );
        s_addressToToken[msg.sender].tokenAmount =
            s_addressToToken[msg.sender].tokenAmount +
            tokenToTransfer *
            DECIMALS;
        emit TokenBought(msg.sender, tokenToTransfer);
    }

    function distributeToken(
        address winner1,
        address winner2,
        address winner3
    ) public payable {
        uint256 totalAmountHeldByContract = address(this).balance;
        uint256 totalAmountToDistribute = (totalAmountHeldByContract * 4) / 5;
        uint256 amountCreditedToOwner = totalAmountHeldByContract -
            totalAmountToDistribute;
        uint256 amountCreditedToFirst = totalAmountToDistribute / 2;
        uint256 amountCreditedToSecond = (totalAmountToDistribute * 3) / 10;
        uint256 amountCreditedToThird = (totalAmountToDistribute) -
            amountCreditedToFirst -
            amountCreditedToSecond;
        // Pay the winners
        address[] memory addresses = new address[](3);
        addresses[0] = winner1;
        addresses[1] = winner2;
        addresses[2] = winner3;
        uint256[] memory prizes = new uint256[](3);
        prizes[0] = amountCreditedToFirst;
        prizes[1] = amountCreditedToSecond;
        prizes[2] = amountCreditedToThird;
        for (uint16 i = 0; i < 3; i++) {
            (bool callSuccess, ) = payable(addresses[i]).call{value: prizes[i]}(
                ""
            );
            if (!callSuccess) {
                revert GameContract__AmountTransferFailed();
            }
        }
        (bool callSuccess, ) = payable(s_owner).call{
            value: amountCreditedToOwner
        }("");
        if (!callSuccess) {
            revert GameContract__AmountTransferFailed();
        }
        emit WinnersPaid(addresses, prizes);
    }

    // Getter functions
    function getPlayerInfo()
        public
        view
        returns (PlayerInfo memory playerInfo)
    {
        return s_addressToToken[msg.sender];
    }

    function getTokenNeededToPlay() public view returns (uint256 amount) {
        return i_tokenNeededToPlay;
    }

    function getInitialTokenGiven() public view returns (uint256 amount) {
        return i_initialTokenGivenToPlayers;
    }

    function getNumberOfPlayers() public view returns (uint256 number) {
        return s_numberOfPlayers;
    }

    function getTokenOf(address player) public view returns (uint256 amount) {
        return s_token.balanceOf(player);
    }

    function getConversion(uint256 amount)
        public
        view
        returns (uint256 convertedAmount)
    {
        return amount.getConversionRate(s_priceFeed);
    }

    function getTotalTokenSupply() public view returns (uint256 amount) {
        return s_token.totalSupply();
    }

    function getPriceFeedDecimals() public view returns (uint8 decimals) {
        return s_priceFeed.decimals();
    }
}

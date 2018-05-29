pragma solidity ^0.4.21; 
import "./Ownable.sol";

/**
 * @title EternalCanvas
 * @dev The EternalCanvas contract allows people to interact with the Ethernal canvas (place bids, redeem bid if overbid and draw acquired pixels). 
 * The owner can empty the balance of the contract, but for future editions this should be a DAO
 * TODO: Check whether the way of storing pixels is most efficient
 * TODO: Think about a different auction model
 * TODO: More expressiveness in colors?
 */

contract EternalCanvas is Ownable {
   
    // @Erik: events are a different way for the blockchain to store information. Accessing events
    // is easier and more efficient from the web, but they don't have the nice irreversibility property. 
    // it is comon to have events that capture all state-changing events in a contract, such that you could
    // ideally rebuild the current state by applying all events consequently to the initial state. 
    // indexed means that you can filter on the event (such as I already made a filter in the .js file: {potentialArtis: account}). 
    // event is initialisation of an event. Emit is firing of an event. 
    event logBidPlaced(address indexed potentialArtist, uint bid, uint time);
    event logPixelDrawn(address indexed artist, bytes1 color, uint time, uint position);
    event logOverbidRedeemed(address indexed bidder, uint amount);
    event logBalanceRedeemed(address indexed owner, uint amount);

    // @Erik: let's do the mini-mini mvp 100 pixels (10x10)
    uint public pixelAmount = 100;
    bytes1[100] public pixels;
    uint ownerBalance;
    
    // @Erik: you probably know a struct. Practically, we use the struct on line 38, to map the time to a bid
    struct bid {
        address artist;
        uint highestBid;
        bool accountedFor;
    }

    // @Erik: you will see mappings very often in Solidity. They are extremely usefull. Especially mappping(address => uint) is common to map the balance of an address to it's address.
    mapping(uint => bid) drawingRight;
    mapping(address => uint) payback;
    

    /**
    * @dev Allows the user to place a bid on the right to draw at the canvas between time and time + 2 days. Time intervals are in minutes, bids can only placed for a time in the future, 
    * msg.value must be higher than the current highest bid, and the bid will be allowed to redeem for the previously highest bidder.
    * @param time unix timestamp (Date, hours, minutes, seconds in UTC) since 1970
    */
    function purchaseRight(uint time) public payable {
        require(time % 1 minutes == 0);
        require(time >= now);
        require(msg.value > drawingRight[time].highestBid);
        payback[drawingRight[time].artist] = payback[drawingRight[time].artist] + drawingRight[time].highestBid;
        drawingRight[time].artist = msg.sender;
        drawingRight[time].highestBid = msg.value;
        emit logBidPlaced(msg.sender, msg.value, time);
    }
    
    /**
    * @dev Allows the user to redeem his balance which exists out of the value of overbidden bids. 
    */
    function redeemOverbid () public {
        require(payback[msg.sender] != 0);
        uint amount = payback[msg.sender];
        payback[msg.sender] == 0;
        msg.sender.transfer(amount);
    }
    
    /**
    * @dev Allows the user to use the previously acquired right to draw on the canvas. 
    * @param time unix timestamp (Date, hours, minutes, seconds in UTC) since 1970
    */
    function draw(uint time, bytes1 color, uint position) public {
        // 0 = red, 1 = green, 2 = blue
        require(color == 0 || color == 1 || color == 2);
        require(position <= 100);
        require(time % 1 minutes == 0);
        // an artist can draw in the period after the auction has closed and this time + 2 days
        //TODO: time / now is inaccurate which can bring security issues / disappointed artists
        require(!drawingRight[time].accountedFor);
        // if it is less than 2 days after the end of the auction, only the purchaser has the right to draw, otherwise anybody can draw. 
        if(now > time && now <= time + 2 days) {
            require(drawingRight[time].artist == msg.sender);
        } else {
            require(now > time + 2 days);
        }
        require(ownerBalance <= ownerBalance + drawingRight[time].highestBid);
        ownerBalance += drawingRight[time].highestBid;
        drawingRight[time].accountedFor = true;
        pixels[position] = color;
        emit logPixelDrawn(msg.sender, color, time, position);
    }
    
    function redeemBalance() onlyOwner public {
        emit logBalanceRedeemed(msg.sender, ownerBalance);
        ownerBalance = 0;
        owner.transfer(ownerBalance);
    }
}
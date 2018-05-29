pragma solidity ^0.4.21; 
import "./Ownable.sol";

contract EternalCanvas is Ownable {
    //TODO! Check for more optimal way of storing pixels;
   // TODO: Think about auction models. Undisclosed bids / 2nd highest bid win, etc
   
    event logBidPlaced(address indexed potentialArtist, uint bid, uint time);
    event logPixelDrawn(address indexed artist, bytes1 color, uint time, uint position);
    event logBalanceRedeemed(address indexed owner, uint amount);
    uint public pixelAmount = 1000000;
    bytes1[1000000] public pixels;
    uint ownerBalance;
    
    //TODO: time inside struct?
    struct bid {
        address artist;
        uint highestBid;
        bool accountedFor;
    }

    mapping(uint => bid) drawingRight;
    mapping(address => uint) payback;
    
    function purchaseRight(uint time) public payable {
        // only intervals of 1 minute are allowed
        require(time % 1 minutes == 0);
        //auction ends 2 days before pixel can be used
        require(time >= now);
        require(msg.value > drawingRight[time].highestBid);
        //integer overflow check
        require(payback[drawingRight[time].artist] <= payback[drawingRight[time].artist] + drawingRight[time].highestBid);
        //pay back the previous highest bidder
        payback[drawingRight[time].artist] = payback[drawingRight[time].artist] + drawingRight[time].highestBid;
        drawingRight[time].artist = msg.sender;
        drawingRight[time].highestBid = msg.value;
        emit logBidPlaced(msg.sender, msg.value, time);
    }
    
    function redeemPayback () public {
        require(payback[msg.sender] != 0);
        uint amount = payback[msg.sender];
        payback[msg.sender] == 0;
        msg.sender.transfer(amount);
    }
    
    function draw(uint time, bytes1 color, uint position) public {
        // 0 = r, 1 = g, 2 = b
        // TODO more expressiveness in colors?
        require(color == 0 || color == 1 || color == 2);
        require(position <= 1000000);
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
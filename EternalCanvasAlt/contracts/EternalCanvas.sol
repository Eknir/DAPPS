pragma solidity ^0.4.21; 
import "./Ownable.sol";

//TODO: overflow checks
contract EternalCanvas is Ownable {
    
    struct rentAgreementStruct {
    	address rentor;
    	uint price;
    	uint blocksRented;
    	uint untilBlock;
    }
    
	rentAgreementStruct[100] public rentAgreements;
	bytes1[100] public pixels;
    uint public ownerBalance;
    mapping(address => uint) payback;
    
    event logRentalStarted(uint indexed position, address rentor, uint price);
    event logRentalProlonged(uint indexed position, address rentor);
    event logDrawn(uint indexed position, address rentor, bytes1 color);
    event logPaybackRedeemed(address indexed beneficiary, uint value);
    event logOwnerBalanceRedeemed(address indexed owner, uint value);

    function startRental(uint position, uint _price) public payable {
        require(msg.value != 0);
        require(msg.value % _price == 0);
        // if there is no previous renter...
        if (block.number > rentAgreements[position].untilBlock) {
            // give expired rent to owner
            //TODO: overflow check
            ownerBalance += (rentAgreements[position].blocksRented * rentAgreements[position].price);
            // write new rentAgreement
            rentAgreements[position].rentor = msg.sender;
		    rentAgreements[position].price = _price;
		    rentAgreements[position].untilBlock = (block.number + (msg.value / _price));
		    emit logRentalStarted(position, msg.sender, _price);
        }
        // if there is a previous renter, the new rentor must commit to a higher price
        //TODO: assure you can do 1.2 * (...)
    	else if ((_price >= 2 * rentAgreements[position].price)) {
    	    //only rent out if the value of the new rentor is more than the value left by the previous rentor...
    	    require(msg.value >= (rentAgreements[position].untilBlock - block.number) * rentAgreements[position].price);
    	    //and payback the previous rentor
    		//TODO: overflow check
			payback[msg.sender] += ((rentAgreements[position].untilBlock - block.number) * rentAgreements[position].price);
			// give expired rent to owner
			ownerBalance += ((rentAgreements[position].blocksRented - (rentAgreements[position].untilBlock - block.number)) * rentAgreements[position].price); 
	    	// write new rentAgreement
            rentAgreements[position].rentor = msg.sender;
		    rentAgreements[position].price = _price;
		    rentAgreements[position].untilBlock = (block.number + (msg.value / _price));
		    emit logRentalStarted(position, msg.sender, _price);
		} else {
		    revert();
		}
    }
    
    function prolongRental(uint position) public payable {
        require(rentAgreements[position].rentor == msg.sender);
        require(rentAgreements[position].untilBlock >= block.number);
        require(msg.value % rentAgreements[position].price == 0);
        ownerBalance += ((rentAgreements[position].blocksRented - (rentAgreements[position].untilBlock - block.number)) * rentAgreements[position].price); 
        rentAgreements[position].untilBlock = rentAgreements[position].untilBlock - block.number + (msg.value / rentAgreements[position].price);
        emit logRentalProlonged(position, msg.sender);
    }

    function draw(uint position, bytes1 color) public {
        require(rentAgreements[position].rentor == msg.sender);
        require(color == 0 || color == 1 || color == 2);
        require(position <= 100);
        pixels[position] = color;
        emit logDrawn(position, msg.sender, color);
    }
    
    function redeemPayback() public {
        require(payback[msg.sender] != 0);
        uint value = payback[msg.sender];
        payback[msg.sender] == 0;
        msg.sender.transfer(value);
        emit logPaybackRedeemed(msg.sender, value);
    }
    
    function redeemOwnerBalance() onlyOwner public {
        uint value = ownerBalance;
        ownerBalance = 0;
        owner.transfer(ownerBalance);
        emit logOwnerBalanceRedeemed(msg.sender, value);
    }
}

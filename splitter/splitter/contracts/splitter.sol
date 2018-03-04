pragma solidity ^0.4.17;

contract Splitter {
	address alice;
	address bob;
	address carol;

	function Splitter(address _bob, address _carol) public payable {
		alice = msg.sender;
		bob = _bob;
		carol = _carol;
	}

	function getBalance() public view returns (uint) {
		return this.balance;
	}

	function splitAlice() public payable returns (bool) {
		require(msg.sender == alice);
		uint value = msg.value;
		uint half = value /2;
		bob.transfer(half);
		carol.transfer(half);
		return true;
	}

	function getIndividualBalance() public view returns (
		uint,
		uint,
		uint) {

		return(alice.balance, bob.balance, carol.balance);
		    
		}


	function() public payable {

	}
}
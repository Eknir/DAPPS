pragma solidity ^0.4.17;

contract Splitter {
	address Alice;
	address Bob = 0x627306090abab3a6e1400e9345bc60c78a8bef57; // some random ethereum address
	address Carol = 0xf17f52151ebef6c7334fad080c5704d77216b732; // some random ethereum address

	function Splitter() public payable {
		Alice = msg.sender;
	}

	function getBalance() public view returns (uint) {
		return this.balance;
	}

	function splitAlice() public payable returns (bool) {
		assert(msg.sender == Alice)
		//TODO
	}

	function getIndividualBalance() public view returns (
		uint,
		uint,
		uint)

	function() payable {
		
	}
}
pragma solidity ^0.4.17;

contract Splitter {
	address Alice;
	address Bob;
	Address Alice;

	function Splitter() public payable {
		owner = msg.sender;
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
}
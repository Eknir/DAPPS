pragma solidity ^0.4.17;

contract Splitter {
	address alice;
	address bob;
	address carol;

	mapping(address => uint) balances;

	// modifier is alice

	function Splitter(address _bob, address _carol) public payable {
		alice = msg.sender;
		bob = _bob;
		carol = _carol;
	}

	function getBalance() public view returns (uint) {
		return this.balance;
	}

	function split() public returns (bool) {
		require(msg.sender == alice);
		uint half = balances[alice] / 2;
		balances[carol] += half;
		balances[bob] += half;
		return (true);
	}

	function getIndividualBalance() public view returns (
		uint,
		uint,
		uint) {

		return(balances[alice], balances[bob], balances[carol]);
		    
		}


	function() public payable { // this is the deposit
		balances[alice]+= msg.value;
	}
}
pragma solidity ^0.4.17;

contract Splitter {
	address alice;
	address bob// = 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c; // fill in yourself!
	address carol// = 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db; // fill in yourself!
	
	event logDeposit(uint _depositAmount);
	event logWithdrawal(address _receiver, uint _value);
	event logSplit(uint _splitAmount);

	mapping(address => uint) balances;

	// modifier is alice

	function Splitter(address _bob, address _carol) public {
		bob = _bob;
		carol = _carol;
		alice = msg.sender;
	}

	function getBalance() public view returns (uint) {
		return this.balance;
	}
	
	function deposit() public payable {
	    require(msg.sender == alice);
	    balances[alice] += msg.value;
	    logDeposit(msg.value);
	}

	function split() public returns (bool) {
		require(msg.sender == alice);
		uint half = balances[alice] / 2;
	    balances[alice] = 0;
		balances[carol] += half;
		balances[bob] += half;
		logSplit(half * 2);
		return (true);
	}
	
	function withdraw() public returns(address) {
	    uint value = balances[msg.sender];
	    balances[msg.sender] = 0;
	    msg.sender.transfer(value);
	    return msg.sender;
	    logWithdrawal(msg.sender, value);
	}

	function getIndividualBalance() public view returns (
		uint, address,
		uint, address,
		uint, address) {

		return(balances[alice], alice, balances[bob], bob, balances[carol], carol);
		    
		}
		
	function() public {
}
}
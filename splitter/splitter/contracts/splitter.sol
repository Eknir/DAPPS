pragma solidity ^0.4.17;

contract Splitter {
	address alice;
	address bob; //= 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c; 
	address carol; // =0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db;
	
	event LogDeposit(uint _depositAmount);
	event LogSplit(uint _newBalanceBob, uint _newBalanceCarol);
	event LogWithdrawal(address indexed _receiver, uint _value);

	mapping(address => uint) balances;

	// modifier is alice

	function Splitter(address _bob, address _carol) public {
		alice = msg.sender;
		bob = _bob;
		carol = _carol;
	}

	function getBalance() public view returns (uint) {
		return this.balance;
	}
	
	function split() public payable {
	    require(msg.sender == alice);
	    uint half = msg.value/2;
	    balances[bob] += half;
	    balances[carol] += half;
	    LogSplit(balances[bob], balances[carol]);
	}
	
	function withdraw() public {
	    uint value = balances[msg.sender];
	    balances[msg.sender] = 0;
	    msg.sender.transfer(value);
	    LogWithdrawal(msg.sender, value);
	}

	function getIndividualBalance() public view returns (
		uint, address,
		uint, address,
		uint, address
		) {
		return(
		    balances[alice], alice, 
		    balances[bob], bob, 
		    balances[carol], carol
		    );
		}
		
	function() public {
    }
}
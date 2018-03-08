pragma solidity ^0.4.17;

contract Splitter {
	address alice;
	address bob; 
	address carol; 
	
	event LogDeposit(uint _depositAmount);
	event LogSplit(uint _newBalanceBob, uint _newBalanceCarol);
	event LogWithdrawal(address indexed _receiver, uint _value);

	mapping(address => uint) balances;

	function Splitter(address _bob, address _carol) public {
		alice = msg.sender;
		bob = _bob;
		carol = _carol;
	}

	function getBalance() public view returns (uint) {
		return this.balance;
	}
	
	function split() public payable {
		//TODO! odd numbers
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
		//TODO revert()
    }
}

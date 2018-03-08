pragma solidity ^0.4.17;

contract Splitter {
	address public alice;
	address public bob; 
	address public carol; 
	event LogDeposit(uint _depositAmount);
	event LogSplit(uint _value, address indexed _sender);
	event LogWithdrawal(address indexed _receiver, uint _value);

	mapping(address => uint) balances;

	function Splitter(address _bob, address _carol) public {
		alice = msg.sender;
		bob = _bob;
		carol = _carol;
	}
	
	function split() public payable {
	    require(msg.sender == alice);
	    if(msg.value % 2 != 0) {
	    	balances[alice] += 1;
	    }
	    uint half = msg.value/2;
	    balances[bob] += half;
	    balances[carol] += half;
	    LogSplit(msg.value, msg.sender);
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
		revert();
    }
}

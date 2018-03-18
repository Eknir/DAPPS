pragma solidity ^0.4.19;

contract Owned {

    address public alice;

    event logKill(bool _kill, address indexed _sender);

    /*this function is executed at initialization and sets the owner of the contract */
    function Owned() { 
    alice = msg.sender; }

    modifier onlyAlice() {
        require(msg.sender == alice);
        _;
    }
}

contract Mortal is Owned {
        bool alive = true;
    /* Function to recover the funds on the contract */
    function kill() public onlyAlice() returns(bool) {
        alive = false;
        return (alive);
    }

    modifier isAlive() {
        require(alive);
        _;
    }

}
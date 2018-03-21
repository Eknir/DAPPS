pragma solidity ^0.4.19;

contract Remittance {

    address public owner;
    bool public alive = true;

    // variables sender and deadline are needed to provide the option to retrieve unclaimed remittance
    struct remittanceStruct {
        uint value;
        uint deadline;
    }
    
    // We create a special container which can be accessed by a special hash
    mapping(bytes32 => remittanceStruct) public contracts;
    // We keep track for a nonce (contract Number) for every user, to prevent the user from creating identical contracts
    mapping(address => uint) public nonces;

    event LogRemittanceCreated(address indexed _sender, uint _value, uint _nonce, address indexed _exchange, bytes32 _secretsHash, uint16 _duration, bytes32 identifier);
    event LogRemittanceSolved(address indexed _exchange, uint _value, uint _nonce, address indexed _sender);
    event LogRemittanceRetrieved(address indexed _sender, uint _value, uint _nonce );
    event LogKilled(bool _killed);

    function Remittance() {
        owner = msg.sender;
    }

    modifier isAlive() {
        require(alive);
        _;
    }

    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }
    
    //This function sets up a remittance container which is identified by a special hash
    function createRemittance(
        address _exchange, 
        bytes32 _secretsHash,
        uint16 _duration
    ) 
        public
        isAlive 
        payable
    {
        // the maximum deadline is 65535 (max range of uint16), which approximates to 1.5 week, given an average blocktime of 15 seconds
        require(_duration <= 65535);

        // We identify each container by the hash of the passwords and the address of the exchange
        bytes32 identifier = keccak256(nonces[msg.sender], msg.sender, _exchange, _secretsHash);
        
        // update the nonce, such that the next contract created will have it's unique identifier 
        nonces[msg.sender] +=1; 
        contracts[identifier].value = msg.value;    
        contracts[identifier].deadline = block.number + _duration;
    
        LogRemittanceCreated(msg.sender, msg.value, (nonces[msg.sender] -1), _exchange, _secretsHash, _duration, identifier);
    }
    
    // This function can be called by the exchange and will send the ether if the correct passwords are given
    function solveRemittance(
        uint nonce,
        string secret1,
        string secret2,
        address sender
    ) 
    public {
        bytes32 identifier = keccak256(nonce, sender, msg.sender, keccak256(secret1, secret2));
        
        uint value = contracts[identifier].value;
        contracts[identifier].value == 0;
        
        LogRemittanceSolved(msg.sender, value, nonce, sender);

        msg.sender.transfer(value);
    }
    
    // This function give the option to a remittance contract creator to claim back the value of the remittance after the deadline expiress
    function retrieveRemittance(
        uint nonce,
        string secret1,
        string secret2,
        address _exchange
    ) 
    public {
        bytes32 identifier = keccak256(nonce, msg.sender, _exchange, keccak256(secret1, secret2));
        require(block.number > contracts[identifier].deadline);
        
        uint value = contracts[identifier].value;
        contracts[identifier].value == 0;

        LogRemittanceRetrieved(msg.sender, value, nonce);

        msg.sender.transfer(value);
    }

    //TODO make an event here as well
    function kill() public isOwner {
        alive = false;
        LogKilled(!alive);
    }
    
    // This function is just for convenience, do not use it in production!
    function hash(string _secretOne, string _secretTwo) public view returns(bytes32) {
        bytes32 hashed = keccak256(_secretOne, _secretTwo);
        return(hashed);
    }

}
    
    


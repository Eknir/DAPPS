pragma solidity ^0.4.1;

contract Remittance {
    
    struct remittanceStruct {
        address sender;
        uint value;
        address exchange;
        bytes32 secret1Hash;
        bytes32 secret2Hash;
        uint deadline;
    }
    
    mapping(address => uint) nonce;
    mapping(bytes32 => remittanceStruct) contracts;
    
    event logSolved(address indexed _exchange, uint value);
    event logRemittanceCreated(address indexed _sender, uint _nonce, uint _value, address indexed _exchange, bytes32 _secret1Hash, bytes32 _secret2Hash, uint16 _duration );
    
    function createRemittance(
        address _exchange, 
        bytes32 _secret1Hash, 
        bytes32 _secret2Hash, 
        uint16 _duration
    ) 
        public 
        payable
        returns(
            uint,
            bytes32) 
    {
        require(_duration <=  65535); // maximum deadline (also max range of uint 16)
            
        // We identify each contract by the hash of the address and a nonce
        bytes32 contractId = keccak256(msg.sender, nonce[msg.sender]);
            
        // Set contract values
        contracts[contractId].sender = msg.sender;
        contracts[contractId].value = msg.value;
        contracts[contractId].exchange = _exchange;
        contracts[contractId].secret1Hash = _secret1Hash;
        contracts[contractId].secret2Hash = _secret2Hash;
        contracts[contractId].deadline = block.number + _duration;
            
        // Check for integer overflow and update address
        assert(nonce[msg.sender] < (nonce[msg.sender] + 1));
        nonce[msg.sender] += 1;

        return(nonce[msg.sender] -1, contractId);
        
        // Event    
        logRemittanceCreated(msg.sender, (nonce[msg.sender] -1), msg.value, _exchange, _secret1Hash, _secret2Hash, _duration);
    }
    
    // This function can be called to view the remittance contracts
    function getRemittance(
        address _sender,
        uint _nonce
    ) 
        public 
        view 
        returns(
            address _exchange, 
            bytes32 _secret1Hash, 
            bytes32 _secret2Hash, 
            uint _deadline
        ) 
    {
        bytes32 contractId =  keccak256(_sender, _nonce);
        
        return (
            contracts[contractId].exchange,
            contracts[contractId].secret1Hash,
            contracts[contractId].secret2Hash,
            contracts[contractId].deadline
        );
        
    }
    
    // This function can be called by the exchange and will send the ether if the deadline has not passed and the correct passwords are given
    function solveRemittance(
        bytes32 _contractId, 
        string secret1, 
        string secret2
    ) 
    public {
        // Requirements
        require(block.number <= contracts[_contractId].deadline);
        require(msg.sender == contracts[_contractId].exchange);
        require(keccak256(secret1) == contracts[_contractId].secret1Hash);
        require(keccak256(secret2) == contracts[_contractId].secret2Hash);
        
        // Send if requirements are met
        msg.sender.transfer(contracts[_contractId].value);
        
        // Event
        logSolved(msg.sender, contracts[_contractId].value);
    }
    
    // This function sends back the ether to the sender if the deadline has passed
    function retrieve(bytes32 _contractId) public {
        require(msg.sender == contracts[_contractId].sender);
        require(block.number >= contracts[_contractId].deadline);
        msg.sender.transfer(contracts[_contractId].value);
    }
    
    // This function is just for testing purposes
      function hash(string _secret1, string _secret2) public returns(bytes32, bytes32) {
        bytes32 hash1 = keccak256(_secret1);
        bytes32 hash2 = keccak256(_secret2);
        return(hash1, hash2);
    }
    
}
    
    
    


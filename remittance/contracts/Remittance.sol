pragma solidity ^0.4.1;

contract Remittance {
    
    struct remittanceStruct {
        address sender;
        address exchange;
        bytes32 secret1Hash;
        bytes32 secret2Hash;
        uint value;
        uint deadline;
    }
    
    mapping(address => uint) nonce;
    mapping(bytes32 => remittanceStruct) contracts;
    
    event logSolved(address indexed _exchange, uint value);
    event logRemittanceCreated(address indexed _sender, address indexed _exchange, bytes32 _secret1Hash, bytes32 _secret2Hash, uint _value, uint16 _duration );
    
       function createRemittance(address _exchange, bytes32 _secret1Hash, bytes32 _secret2Hash, uint _value, uint16 _duration) public payable {
            require(_duration <=  65535); // maximum deadline (also max range of uint 16)
            
            // We identify each contract by the hash of the address and a nonce
            bytes32 contractId = keccak256(nonce[msg.sender], msg.sender);
            
            // Set contract values
            contracts[contractId].sender = msg.sender;
            contracts[contractId].exchange = _exchange;
            contracts[contractId].secret1Hash = _secret1Hash;
            contracts[contractId].secret2Hash = _secret2Hash;
            contracts[contractId].value = _value;
            contracts[contractId].deadline = now + _duration;
            
            // Check for integer overflow and update address
            assert(nonce[msg.sender] < (nonce[msg.sender] + 1));
            nonce[msg.sender] += 1;
            
            logRemittanceCreated(msg.sender, _exchange, _secret1Hash, _secret2Hash, _value, _duration);
    }
    
    function Solve(bytes32 _contractId, string secret1, string secret2) public {
        require(now <= contracts[_contractId].deadline);
        require(msg.sender == contracts[_contractId].exchange);
        require(keccak256(secret1) == contracts[_contractId].secret1Hash);
        require(keccak256(secret2) == contracts[_contractId].secret2Hash);
        msg.sender.transfer(contracts[_contractId].value);
        logSolved(msg.sender, contracts[_contractId].value);
    }
    
    function retrieve(bytes32 _contractId) public {
        require(msg.sender == contracts[_contractId].sender);
        require(now >= contracts[_contractId].deadline);
        msg.sender.transfer(contracts[_contractId].value);
    }
    
      function hash(string _secret1, string _secret2) public returns(bytes32, bytes32) {
        bytes32 hash1 = keccak256(_secret1);
        bytes32 hash2 = keccak256(_secret2);
        return(hash1, hash2);
    }
    
}
    
    
    


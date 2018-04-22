pragma solidity ^0.4.21; 
import "./Rchain.sol";

/**
 * @title Genesis
 * @dev The Genesis contract is an Rchain contract which imports Rchain (that imports Ownable and Pausable).
 * The aim of this contract is to benefit from the transparacy and immutability of Ethereum with regards to the 
 * publication of the bits which combined will form the blockheight at which the Genesis balances of Rchain will be defined.
 * The owner of the contract can publish the bits, after which trusted persons and coop members can attest on its correctness.
 */
contract Genesis is Rchain{
    event bitAdded(address indexed attester, uint8 bit, uint indexed bitsPublished);
    event trustedPersonBitAttested(address indexed attester, uint8 bit);
    event coopMemberBitAttested(address indexed attester, uint8 bit);
    
    // keeps track of the amount of bits published
    uint public bitPosition;
    
    //TODO! What is the total amount of bits which will make up the blockchain height? -> make it a fixed size array
    // array to keep track of all published bits
    uint8[] public blockHeightBits;
    
    // maps the bitposition to an array of trusted attesters (pyrofex/coop board members) who attested on the correctness of the bit at that position
    mapping(uint => address[]) public trustedAttesters;
    
    // maps the bitposition to an array of member attesters who attested on the correctness of the bit at that position
    mapping(uint => address[]) public memberAttesters;
    
    /**
    * @dev this function sets the next bit in the blockHeightBits array. The first attester is the msg.sender (owner of the contract)
    * CAUTION! Once published, a bit cannot be reverted anymore
    */
    function setBlockHeightBit(uint8 _bit) whenNotPaused onlyOwner public {
        require((_bit ==  1) || (_bit == 0));
        blockHeightBits.push(_bit);
        trustedAttesters[bitPosition].push(msg.sender);
        bitPosition ++;
        emit bitAdded(msg.sender, _bit, bitPosition);
    }
    
    /**
    * @dev this function allows trusted persons to attest on the correctness of a published bit. Attestation is done to improve reliability of the information in the contract
    */
    function trustedPersonAttestBlockHeight(uint8 _bitPosition) onlyTrustedPerson whenNotPaused public {
        require(_bitPosition < bitPosition);
        trustedAttesters[_bitPosition].push(msg.sender);
        emit trustedPersonBitAttested(msg.sender, _bitPosition);
    }
    
    /**
    * @dev This function allows coop membes to attest on the correctness of a published bit. Attestation is done to improve reliability of the information in the contract
    */
    function coopMembersAttestBlockHeight(uint8 _bitPosition) onlyCoopMember whenNotPaused public {
        require(_bitPosition < bitPosition);
        memberAttesters[_bitPosition].push(msg.sender);
        emit coopMemberBitAttested(msg.sender, _bitPosition);
    }
}
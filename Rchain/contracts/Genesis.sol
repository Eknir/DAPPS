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
    
    //24 bit unsigned int can represent [0- 16,777,215]. Projected blockheight at 31 dec 2018 is 6,360250 
    // == 5,485,368 (current blockheight)+ 2185900(seconds till 31/12) / 25(average blocktime in seconds)
    // array to keep track of all published bits
    uint8[24] public blockHeightBits;
    
    // maps the bitposition to an array of trusted attesters (pyrofex/coop board members) who attested on the correctness of the bit at that position
    mapping(uint => address[]) public trustedAttesters;
    
    // maps the bitposition to an array of member attesters who attested on the correctness of the bit at that position
    mapping(uint => address[]) public memberAttesters;
    
    /**
    * @dev this function sets the next bit in the blockHeightBits array. The first attester is the msg.sender (owner of the contract)
    * CAUTION! Once published, a bit cannot be reverted anymore
    */
    function setBlockheightBit(uint8 _bit) whenNotPaused onlyOwner public {
        require((_bit ==  1) || (_bit == 0));
        blockHeightBits.push(_bit);
        trustedAttesters[bitPosition].push(msg.sender);
        bitPosition ++;
        emit bitAdded(msg.sender, _bit, bitPosition);
    }
    
    /**
    * @dev this function allows trusted persons or coop members to attest on the correctness of a published bit. 
    * Attestation is done to improve reliability of the information in the contract.
    * A distinction between coop members and trusted persons is made since trusted persons are 
    * expected to have heard about the correctness of a bit from a primary source, whereas coop members most likely have heard 
    * about the correctness via a (possibly hijacked) communication channel.
    */
    function attestBit(uint8 _bitPosition) onlyTrustedOrCoop whenNotPaused public {
        require(_bitPosition < bitPosition);

        if(coopMembers[msg.sender]) {
            memberAttesters[_bitPosition].push(msg.sender);
            emit coopMemberBitAttested(msg.sender, _bitPosition)
        } else {
            trustedAttesters[_bitPosition].push(msg.sender);
            emit trustedPersonBitAttested(msg.sender, _bitPosition);
        }
    }
}
pragma solidity ^0.4.21; 
import "../Open_Zeppelin/Pausable.sol";

/**
 * @title Rchain
 * @dev The Rchain contract imports Pausable (which imports Ownable). The Rhcain contract mimics the structure of the Rchain project 
 * which has Coop members and trusted persons (board members/ pyrofex employees).
 */
contract Rchain is Pausable {
    
    event trustedPersonAdded(address indexed trustedPersonAddress, string trustedPersonName);
    event coopMemberAdded(address indexed coopMemberAddress);
    event trustedPersonRemoved(address indexed trustedPersonAddress);
    event coopMemberRemoved(address indexed coopMemberAddress);
    
    // pyrofex employees / coop board members addresses
    address[] public trustedPersonsList;
    
    // coop members addresses
    address[] public coopMembersList;
    
    // mapping to simplify lookup of whether an address belong to a trusted person. The string represents the name of the person
    mapping(address => string) public trustedPersons;
    
    // mapping to simplify lookup of whether an address belongs to a coop member
    mapping(address => bool) coopMembers;
    
    /**
    * @dev throws when the caller is not a trusted person, not used in Genesis contract
    */
    modifier onlyTrustedPerson() {
        require(keccak256(trustedPersons[msg.sender]) != keccak256(""));
        _;
    }
    
    /**
    * @dev throws when the caller is not a coop member, not used in Genesis contract
    */
    modifier onlyCoopMember {
        require(coopMembers[msg.sender]);
        _;
    }

    /**
    * @dev throws when the calles is neither a coop member nor trusted person
    */
    modifier onlyTrustedOrCoop() {
        require((coopMembers[msg.sender]) || (keccak256(trustedPersons[msg.sender]) != keccak256(""))
    }
    
     /**
    * @dev sets an Ethereum address as a trusted person and assigns a (real world) name to this address
    */
    function setTrustedPerson(address _addressTrustedPerson, string _nameTrustedPerson) onlyOwner whenNotPaused public {
        // requirements to check the validity of an address, 
        // name and whether the address does not belong already to a coop member
        require(_addressTrustedPerson != address(0));
        require(keccak256(_nameTrustedPerson) != keccak256(""));
        require(coopMembers[_addressTrustedPerson] != true);
        trustedPersonsList.push(_addressTrustedPerson);
        trustedPersons[_addressTrustedPerson] = _nameTrustedPerson;
        emit trustedPersonAdded(_addressTrustedPerson, _nameTrustedPerson);
    }
    
    /**
    * @dev sets an Ethereum address as a coop member
    */
    function setCoopMember(address _addressCoopMember) onlyOwner whenNotPaused public {
        // requirements to check the validity of an address and 
        // whether the address does not belong already to a coop member
        require(_addressCoopMember != address(0));
        require(keccak256(trustedPersons[_addressCoopMember]) == keccak256(""));
        coopMembersList.push(_addressCoopMember);
        coopMembers[_addressCoopMember] = true;
        emit coopMemberAdded(_addressCoopMember);
    } 
     
    /**
    * @dev removes an Ethereum address as a trusted person
    */
    function removeTrustedPeron(uint _trustedPersonsListPosition) onlyOwner whenNotPaused public {
        emit trustedPersonRemoved(trustedPersonsList[_trustedPersonsListPosition]);
        trustedPersons[trustedPersonsList[_trustedPersonsListPosition]] = "";
        trustedPersonsList[_trustedPersonsListPosition] = 0;
    }
    
    /**
    * @dev removes an Ethereum address as a coop member
    */
    function removeCoopMember(uint _coopMembersListPosition) onlyOwner whenNotPaused public {
        emit coopMemberRemoved(coopMembersList[_coopMembersListPosition]); 
        coopMembers[coopMembersList[_coopMembersListPosition]] = false;
        coopMembersList[_coopMembersListPosition] = 0;
    }
    
}
    
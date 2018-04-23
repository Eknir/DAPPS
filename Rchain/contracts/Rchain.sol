pragma solidity ^0.4.21; 
import "./Pausable.sol";

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
    mapping(address => bool) public coopMembers;
    
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
        require((coopMembers[msg.sender]) || (keccak256(trustedPersons[msg.sender])) != keccak256(""));
        _;
    }
    
     /**
    * @dev sets an Ethereum address as a trusted person and assigns a (real world) name to this address
    * @param _addressTrustedPerson is the Ethereum address that is controlled by the trusted person
    * @param _nameTrustedPerson is the (real world) name that belongs to the trusted person.
    */
    function setTrustedPerson(address _addressTrustedPerson, string _nameTrustedPerson) onlyOwner whenNotPaused public {
        // requirements to check the validity of an address, 
        // name and whether the address does not belong already to a coop member
        require(_addressTrustedPerson != address(0));
        require(keccak256(_nameTrustedPerson) != keccak256(""));
        require(coopMembers[_addressTrustedPerson] != true);
        // TODO! make sure that a person cannot have a double entry
        trustedPersonsList.push(_addressTrustedPerson);
        trustedPersons[_addressTrustedPerson] = _nameTrustedPerson;
        emit trustedPersonAdded(_addressTrustedPerson, _nameTrustedPerson);
    }
    
    /**
    * @dev sets an Ethereum address as a coop member
    * @param _addressCoopMember is the Ethereum addres that is controlled by the coop member
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
    * @param _trustedPersonsListPosition is the position in the TrustedPersonsList array (ln 17) which stores the address of the trusted person
    */
    function removeTrustedPerson(uint _trustedPersonsListPosition) onlyOwner whenNotPaused public {
        emit trustedPersonRemoved(trustedPersonsList[_trustedPersonsListPosition]);
        trustedPersons[trustedPersonsList[_trustedPersonsListPosition]] = "";
        trustedPersonsList[_trustedPersonsListPosition] = 0;
    }
    
    /**
    * @dev removes an Ethereum address as a coop member
    * @param _coopMembersListPosition is the position in the CoopMembersList array (ln 20) which stores the addresse of the coop member
    */
    function removeCoopMember(uint _coopMembersListPosition) onlyOwner whenNotPaused public {
        emit coopMemberRemoved(coopMembersList[_coopMembersListPosition]); 
        coopMembers[coopMembersList[_coopMembersListPosition]] = false;
        coopMembersList[_coopMembersListPosition] = 0;
    }
    
}

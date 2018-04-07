
pragma solidity ^0.4.21; 

contract EntityFactory {
   
    // this function deploys a new entity, which, on it's turn can call this function again (hereby creating another entity). The result of this, is that there will be a tree-like structure of several entities, on different branches and different depths.
    function createEntity(address _creator, uint _currentDepth, address _newOwner) public returns(Entity _newEntity) {
        return new Entity(_creator, _currentDepth, _newOwner, this);
    }
}

// an entity is identified by it's depth and owner. The entityCreator is the owner of the entity contract on level higher in the chain.
contract Entity {
        address public entityFactory;

        address entityCreator;
        uint public depth;
        address public owner;
    
    // keeps track of who is authorized (use library here?)
    mapping(address => bool) public authorized;
    
    function Entity(address _entityCreator, uint _depth, address _owner, address _entityFactory) {
        entityFactory = _entityFactory;
        entityCreator = _entityCreator;
        depth = _depth;
        owner = _owner;
        
        //library??
        authorized[_owner] = true;
        
        // the depth is incremented to go one level up in the chain
        depth = _depth +1;
    }
    
    // library??
    modifier onlyAuthorized() {
        require(authorized[msg.sender]);
        _;
    }
    
    //Library??
    function toggleAuthorized(address _chief) onlyAuthorized public {
        authorized[_chief] = !authorized[_chief];
    }
    
    // This function calls the entityFactory, hereby creating another entity on level down in the chain.
    function createEntity(address _newOwner) onlyAuthorized returns(Entity _newEntity) {
        EntityFactory instanceEntityFactory = EntityFactory(entityFactory);
        return instanceEntityFactory.createEntity(owner, depth, _newOwner);
    }
}

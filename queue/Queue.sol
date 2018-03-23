pragma solidity ^0.4.19;

contract Queue {

	struct EmployeeStruct {
		string employeeId,
		bool isAdder
	}

	// all necesarry information for an application
	struct ApplictionStruct {
		bytes32 userIdHash,
		bool isProcessed
	}

	mapping(address => String) public admin;
	mapping(address => EmployeeStruct) public employee;

	// the queue
	ApplicationStruct[] public queue;

	// to keep track of the front of the queue
	uint counter;

	// it is alowed to process persons a little ahead in the queue, an admin can change this value
	uint flexibility;

	modifier isAdmin() {
		require admin[msg.sender].employeeId != "";
		_;
	}

	modifier isEmployee() {
		require employee[msg.sender].employeeId != "";
		_;
	}

	// the initiator of the contract will be the first admin
	function Queue(string _employeeId, uint _flexibility) {
		admin[msg.sender] = _employeeId;
		plus = _flexibility;
	}

	// Admins have the right to hire or fire employees
	function setAdmin(string _employeeId, address newAdmin) public isAdmin {
		require(admin[newAdmin].employeeId == "");

		employee[newEmployee].employeeId = _employeeId;
	}

	// This function fires an existing admin from his role and can be only performed by an admin
	function fireAdmin(address firedAdmin) public isAdmin {
		admin[firedAdmin] == "";
	}

	// this function sets the role of the official. To prevent corruption, a role can be either an adder or processor, but not both. Furthermore, we require an official
	// id number, to tie the address of the employee (blockchain identity) to his real life identity.
	function setEmployee(bool _isAdder, address employeeAddress, bytes32 _employeeId) public isAdmin{
		EmployeeStruct[employeeAddress].employeeId = _employeeId;

    	if(_isAdder)
    		EmployeeStruct[employeeAddress].isAdder = true;
    	// if the person will not be an adder, he will be a processor.
    	 else 
    	 	EmployeeStruct[employeeAddress].isAdder = false;
	}

	 // to fire a person from it's role
	function fireEmployee(bytes32 adminId, address firedEmployeeAddress, bytes32 employeeId) public isAdmin {
		EmployeeStruct[firedEmployeeAddress] = "";
	}

	function setFlexibility(uint _flexibility) public isAdmin {
		flexibility = _flexibility;
	}

	// this function adds a person to the queue. The funciton can only be performed by an authorized employee. I imagine that an official document
	// presenting both a picture and governmentId/employeeId is present at the desk, so a user can verify the authorization. The userId should be made up out of
	// a hash of the users social id number + a secret in order to prevent the public to know of the participation of this individual in the queue. 
    function addPerson(bytes32 _userIdHash, bytes32 employeeId) public isEmployee {
    	require(EmployeeStruct[msg.sender].isAdder);
    	
    	ApplicationStruct memory newApplication;
    	newApplication.userIdHash = _userIdHash;

    	queue.push(newApplication);
    }

    // this function processes a person in the queue. Same reasoning as addPerson.
    function processPerson(bytes32 employeeId, uint position) public isEmployee {
    	require(!EmployeeStruct[msg.sender].isAdder);
    	require(position - flexibility <= counter);
    	
    	queue[position].isProcessed = true;
    	counter++;
    }

}

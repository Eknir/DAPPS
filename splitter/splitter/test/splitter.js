const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", accounts => {
	//console.log(Splitter.alice());
	
	var myContract;
	var alice = accounts[0];
	var bob = accounts[1];
	var carol = accounts[2];

	beforeEach(function() {
		return Splitter.new(bob, carol, {from: alice})
		.then(function(instance) {
		myContract = instance;
		});
	});

	it("should be owned by Alice", function() {
		return myContract.split({from: alice})
		.then
		let instance;
		return Splitter.deployed()
		.then(_instance => {
			instance = _instance;
			return instance.alice({from: alice});
		})
		.then(_alice => {
			assert.strictEqual(alice, _alice, "Is not owned by Alice");
		});
	});
});


const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", function(accounts) {
	
	var contract;
	var alice = accounts[0];
	var bob = web3.eth.accounts[1];
	var carol = web3.eth.accounts[2];

	beforeEach(function() {
		return Splitter.new(bob, carol, {from: alice})
		.then(function(instance) {
		contract = instance;
		});
	});

it("Should just say hello", function() {
	assert.strictEqual(true,true,"Something is wrong.");
});

it("should split even amounts", function() {
	return contract({from: alice})
	.then(function(_alice) {
		assert.strictEqual(alice, web3.eth.accounts[0], "Contract is not owned by Alice");
	});
});
})

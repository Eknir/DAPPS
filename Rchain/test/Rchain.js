Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

const Rchain = artifacts.require("./Rchain.sol");

contract("Rchain", accounts => {
	let rchain;
	const owner = accounts[0];
	const trustedPerson = accounts[1];
	const coopMember = accounts[2];
	const justARandomGuy = accounts[3];
	beforeEach(function() {
		Rchain.new({from: owner})
			.then(function(instance) {
				rchain = instance;
			});
		});

	it("Should be Ownable", function() {
		Rchain.deployed()
		.then(instance => {
			return instance.owner()
		})
		.then(_owner => {
			assert.strictEqual(_owner, owner, "Contract is not owner by owner");
		});
	});
});
const assertRevert = require('./helpers/assertRevert');
const assertJump = require('./helpers/assertJump');
const Rchain = artifacts.require("./Rchain.sol");
const Genesis = artifacts.require("./Genesis.sol");

// Todo: For clarity: let justARandomGuy always be an adversary, trusted person: accounts[1] and coop member: accounts[2]
// Todo: comment tests that involve multiple steps
contract("Rchain", accounts => {
	let rchain;
	beforeEach(async function () {
		rchain = await Rchain.new({from: accounts[0]})
		});

	// Tests for function setTrustedPerson
	it('Should prevent non-owners from setting a trusted person', async function () {
    	const owner = await rchain.owner.call();
    	const justARandomGuy = accounts[3];
    	assert.isTrue(owner !== justARandomGuy, "Calling the owner function gave a different account than owner");
    	await assertRevert(rchain.setTrustedPerson(justARandomGuy, "justARandomGuy", { from: justARandomGuy }), "justARandomGuy managed to set a trusted Person");
  	});

	it('Should not accept null addresses', async function () {
		const owner = await rchain.owner.call();
		await assertRevert(rchain.setTrustedPerson(null, "justARandomGuy", {from: owner}), "A null address was accepted as a valid address");
	});

	it('Should not accept empty string as name', async function () {
		const owner = await rchain.owner.call();
		await assertRevert(rchain.setTrustedPerson(owner, "", {from: owner}), "An empty string was accepted as name")
	});

	it('Should not be able to set a coop member as a trusted person', async function () {
		const owner = await rchain.owner.call();
		const justARandomGuy = accounts[3];

		await rchain.setCoopMember(justARandomGuy, {from: owner});
		let firstCoopMember = await rchain.coopMembersList.call(0);
		await assert.equal(firstCoopMember, justARandomGuy, "justARandomGuy is not the first Coop member");
		await assertRevert(rchain.setTrustedPerson(justARandomGuy, "justARandomGuy", {from: owner}), "It accepted justARandomGuy as a trusted member, even though justARandomGuy is already a coop member");

	});

	it("Should correctly process setting a trusted person", async function () {
		const owner = await rchain.owner.call();
		await rchain.setTrustedPerson(owner, "owner", {from: owner});
		let firstTrustedPersonAddress = await rchain.trustedPersonsList.call(0);
		await assert.equal(firstTrustedPersonAddress, owner, "owner is not the first trusted person");
		let firstTrustedPersonName = await rchain.trustedPersons(firstTrustedPersonAddress);
		await assert.equal(firstTrustedPersonName, "owner", "the name of the first trusted person does not equal <owner> ");
	});


	// Tests for function setCoopMember
	it('Should prevent non-owners from setting a coop member', async function () {
		const owner = await rchain.owner.call();
		const justARandomGuy = accounts[3];
		assert.isTrue(owner !== justARandomGuy, "Calling the owner function gave a different account than owner");
		await assertRevert(rchain.setCoopMember(justARandomGuy, { from: justARandomGuy }), "justARandomGuy managed to set a coop member");
	});

	it('Should not accept null addresses when setting a coop member', async function () {
		const owner = await rchain.owner.call();
		await assertRevert(rchain.setCoopMember(null, {from: owner}), "A null address was accepted as a valid address");
	});

	it('Should not be able to set a trusted person as a coop member', async function () {
		const owner = await rchain.owner.call();
		const justARandomGuy = accounts[3];

		await rchain.setTrustedPerson(justARandomGuy, "justARandomGuy", {from: owner});
		let firstTrustedPerson = await rchain.trustedPersonsList.call(0);
		await assert.equal(firstTrustedPerson, justARandomGuy, "justARandomGuy is not the first Coop member");
		await assertRevert(rchain.setCoopMember(justARandomGuy, {from: owner}), "It accepted justARandomGuy as a trusted member, even though justARandomGuy is already a coop member");
	});

	it("Should correctly process setting a coop member", async function () {
		const owner = await rchain.owner.call();

		await rchain.setCoopMember(owner, {from: owner});
		let firstCoopMemberAddress = await rchain.coopMembersList.call(0)
		await assert.equal(firstCoopMemberAddress, owner, "owner is not the first coop member");
		let firstCoopMemberBool = await rchain.coopMembers(firstCoopMemberAddress)
		await assert.strictEqual(firstCoopMemberBool, true, "the address off the coop member does not map to true");
	});

	// Tests for function removeCoopMember
	it("should be able to remove a trusted person", async function () {
		const owner = await rchain.owner.call();
		await rchain.setTrustedPerson(owner, "owner", {from: owner});
		let firstTrustedPersonAddress = await rchain.trustedPersonsList.call(0);
		await assert.equal(firstTrustedPersonAddress, owner, "owner is not the first trusted person");
		let firstTrustedPersonName = await rchain.trustedPersons(firstTrustedPersonAddress);
		await assert.equal(firstTrustedPersonName, "owner", "the name of the first trusted person does not equal <owner> ");
		// remove a trusted person
		await rchain.removeTrustedPeron(0, {from: owner});
		let zeroAddress = await rchain.trustedPersonsList.call(0);
		await assert.equal(zeroAddress, 0, "Address of the first trusted person has not changed to 0x");
		let emptyString = await rchain.trustedPersons(firstTrustedPersonAddress);
		await assert.equal(emptyString, "", "The name of the first trusted person has not changed to empty string")
	})

	it("Should be able to remove a coop member", async function () {
		// set a trusted person
		const owner = await rchain.owner.call();
		await rchain.setCoopMember(owner, {from: owner});
		let firstCoopMemberAddress = await rchain.coopMembersList.call(0);
		await assert.equal(firstCoopMemberAddress, owner, "owner is not the first coop member person");
		let firstCoopMemberBool = await rchain.coopMembers(firstCoopMemberAddress);
		await assert.strictEqual(firstCoopMemberBool, true, "the address off the coop member does not map to true");
		// remove a coop member
		await rchain.removeCoopMember(0, {from: owner});
		let zeroAddress = await rchain.coopMembersList.call(0);
		await assert.equal(zeroAddress, 0, "Address of the first coop member has not changed to 0x");
		let emptyString = await rchain.coopMembers(firstCoopMemberAddress);
		await assert.equal(emptyString, "", "The name of the first trusted person has not changed to empty string")
	})
});

contract("Genesis", accounts => {
	let genesis;
	beforeEach(async function () {
		genesis = await Genesis.new({from: accounts[0]})
		});
	// Tests for function setBlockheightBits
	it('Should not accept numbers other than zero and one as a bit', async function () {
    	const owner = await genesis.owner.call();

    	await assertRevert(genesis.setBlockheightBit(2, {from: owner}), "it accepted a number other than zero or one");
  	});

  	it("Should correctly process setting a bit", async function () {
  		const owner = await genesis.owner.call();
  		let bit = 1;
  		let firstBitPosition = 0;
  		await genesis.setBlockheightBit(bit, {from: owner});
  		let firstBit = await genesis.blockheightBits(firstBitPosition);
  		assert.equal(firstBit.toNumber(10), bit, "firstBit did not equal the bit which was set");
  		let newBitPosition = await genesis.bitPosition();
  		assert.equal(newBitPosition.toNumber(10), firstBitPosition +1, "bitPosition was not incremented");
  	});

  	// Tests for function attestBit
  	it("Should not allow non-coop or non-trusted to attest on a bit", async function () {
  		const owner = await genesis.owner.call();
  		const justARandomGuy = accounts[3];
  		const bit = 1;
  		let firstBitPosition = 0;
  		await genesis.setBlockheightBit(bit, {from: owner});
		await assertRevert(genesis.attestBit(firstBitPosition, bit, {from: justARandomGuy}), "a non-trusted or non-coop could attest ona bit");
  	});

  	it("Should not allow coop members to be the first attester on a bit", async function () {
  		const owner = await genesis.owner.call();
  		const justARandomGuy = accounts[3];
  		const bit = 1;
  		const firstBitPosition = 0;
  		await genesis.setBlockheightBit(bit, {from: owner});
  		await genesis.setCoopMember(justARandomGuy, {from: owner});
  		// contract dit not revert on requirement not satisfied, but instead on invalid jump. Behavior is the same. Not a problem?
  		await assertJump(genesis.attestBit(firstBitPosition, bit, {from: justARandomGuy}), "a non-trusted or non-coop could attest ona bit");
  	})

  	it("Should not allow people to wronlgy attest on the correctness of the bit", async function () {
  		const owner = await genesis.owner.call();
  		const justARandomGuy = accounts[3];
  		const bit = 1;
  		const wrongBit = 0;
  		const firstBitPosition = 0;
  		await genesis.setBlockheightBit(bit, {from: owner});
  		await genesis.setTrustedPerson(justARandomGuy, "justARandomGuy", {from: owner});
  		await assertRevert(genesis.attestBit(firstBitPosition, wrongBit, {from: justARandomGuy}),"There could be an attestation on a value of bit different than expected");
  	});

  	// TODO! Should not allow people to attest twice on the correctness of a bit

  	it("Should allow trusted persons to atest on the correctness of a bit", async function () {
  		const owner = await genesis.owner.call();
  		const justARandomGuy = accounts[3];
  		const bit = 1;
  		let firstBitPosition = 0;

  		await genesis.setBlockheightBit(bit, {from: owner});
  		await genesis.setTrustedPerson(justARandomGuy, "justARandomGuy", {from: owner});
  		await genesis.attestBit(firstBitPosition, bit, {from: justARandomGuy});
  		let firstTrustedAttester = await genesis.trustedAttesters(0,0);
  		await assert.equal(firstTrustedAttester, justARandomGuy);
  	})

  	it("Should allow coop members to attest on the correctness of a bit", async function () {
  		const owner = await genesis.owner.call();
  		const trustedPerson = accounts[1];
  		const coopMember = accounts[2];
  		const bit = 1;
  		const firstBitPosition = 0;
  		// publish bit and let trusted person be first attester
  		await genesis.setBlockheightBit(bit, {from: owner});
  		await genesis.setTrustedPerson(trustedPerson, "trustedPerson", {from: owner});
  		await genesis.attestBit(firstBitPosition, bit, {from:trustedPerson});
  		await genesis.setCoopMember(coopMember, {from: owner});
  		await genesis.attestBit(firstBitPosition, bit, {from: coopMember});
  		let firstCoopAttester = await genesis.memberAttesters(firstBitPosition, 0);
  		await assert.equal(firstCoopAttester, coopMember);
  	})

  	// tests for function overwriteBit
  	it("Should not allow bits who already have more than one attesters to be overwritten", async function () {
  		const owner = await genesis.owner.call();
  		const trustedPerson = accounts[1];
  		const firstBitPosition = 0;
  		const oldBit = 1;
  		const newBit = 0;
  		await genesis.setBlockheightBit(oldBit, {from: owner});
  		await genesis.setTrustedPerson(trustedPerson, "trustedPerson", {from: owner});
  		await genesis.attestBit(firstBitPosition, oldBit, {from:trustedPerson});
  		assertRevert(genesis.overwriteBit(newBit, {from: owner}), "A bit with more than one attester could be overwritten")
  	})

  	it("Should correclty overwrite a bit ")
  	//TODO

});
Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", accounts => {
	var myContract;
	var alice = accounts[0];
	var bob = accounts[1];
	var carol = accounts[2];
	let evenAmount = 400
	let oddAmount = 401
	let remainder = 401 % 2
	let splitAmount = evenAmount / 2

	beforeEach(function() {
		return Splitter.new(bob, carol, {from: alice})
			.then(function(instance) {
				myContract = instance;
			});
	});

	it("Should be owned by Alice", function() {
		return myContract.alice()
			.then(_alice => {
				assert.strictEqual(_alice, alice, "It is not owned by Alice");
			});
		});

	it("Should start with zero balance", function() {
		return web3.eth.getBalancePromise(myContract.address)
			.then(balance => {
				assert.equal(balance.toString(10), '0', "contract did not start with zero balance");
		});
	});

	it("Should split an even number", done => {
		let instance;
		let balance;
		let txHash;
		let balances;
		Splitter.deployed()
			.then( _instance => {
				return myContract.split.sendTransaction({from:alice, value:evenAmount});
			})
			.then(_txHash => {
				txHash = _txHash
				return web3.eth.getBalancePromise(myContract.address)
			})
			.then(_balance => {
				balance = _balance 
				return myContract.getIndividualBalance.call();
			})
			.then(_balances => {
				balances = _balances;
				assert.isString(txHash, "failed to return TxHash");
				assert.equal(balance.toString(10), evenAmount.toString(), "Contract did not update balance correctly");
				assert.equal(balances[2].toString(10), splitAmount.toString(), "contract did split correctly split correctly");
				assert.equal(balances[4].toString(10), splitAmount.toString(), "Contract did not split correctly to Carol");
				done();
			})
			.catch(done);
	})

	it("Should split an odd number", done => {
		let balance
		let txHash;
		Splitter.deployed()
			.then(_instance => {
				return myContract.split.sendTransaction({from:alice, value:oddAmount});
			})
			.then(_txHash => {
				txHash = _txHash
				return web3.eth.getBalancePromise(myContract.address)
			})
			.then(_balance => {
				balance = _balance 
				return myContract.getIndividualBalance.call();
			})
			.then(balances => {
				assert.isString(txHash, "failed to return TxHash");
				assert.equal(balance.toString(10), oddAmount.toString(), "Contract did not update balance correctly");
				assert.equal(balances[0].toString(10), remainder.toString(), "Contract did not split correctly to Alice");
				assert.equal(balances[2].toString(10), splitAmount.toString(), "contract did split correctly to Bob");
				assert.equal(balances[4].toString(10), splitAmount.toString(), "Contract did not split correctly to Carol");
				done();
			})
			.catch(done);
	})

	it("Should not let anybody but Alice split an amount", done => {
		let txHashAlice;
		let txHashBob;
		Splitter.deployed()
			.then(_instance => {
				return myContract.split.sendTransaction({from:alice});
			})
			.then(_txHash => {
				txHashAlice = _txHash
				return myContract.split.sendTransaction({from:bob});
			})
			.catch(function(error) {
				assert.isString(txHashAlice, "failed to return txHashAlice");
				assert.strictEqual(error.toString().slice(0,60), "Error: VM Exception while processing transaction: revert");
				done();

			})
			.catch(done);
	})

	it("Should process a withdrawal correctly", done => {
	let txHashSplit
	let txHashWithdraw
	let balanceBeforeWithdrawal;
	let balanceAfterWithdrawal;
	Splitter.deployed()
			.then(_instance => {
				return myContract.split.sendTransaction({from:alice, value:evenAmount});
			})
			.then(_txHash => {
				txHashSplit = _txHash
			return myContract.getIndividualBalance.call();
		})
		.then(_balances => {
			balanceBeforeWithdrawal = _balances[2];
			return myContract.withdraw.sendTransaction({from:bob})
			})
		.then(_txHash => {
			txHashWithdraw = _txHash;
			return myContract.getIndividualBalance.call();
		})
		.then(_balances => {
			balanceAfterWithdrawal = _balances[2];
			assert.isString(txHashSplit, "failed to return txHashSplit");
			assert.isString(txHashWithdraw, "failed to return txHashString");
			assert.equal(balanceBeforeWithdrawal.toString(10), splitAmount.toString(10), "Contract did not split correctly to Bob");
			assert.equal(balanceAfterWithdrawal.toString(10), '0', "Contract did not process withdrawal correctly");
			done();
		})
		.catch(done)
	})

	it("Should not let anybody but Alice kill the contract", done => {
		let txHash
		Splitter.deployed()
			.then(_instance => {
				return myContract.kill.sendTransaction({from:bob})
			})
			.catch(function(error) {
				assert.strictEqual(error.toString().slice(0,60), "Error: VM Exception while processing transaction: revert");
				done()
			})
			.catch(done)
		})

	it("Should not accept another split after killing the contract", done => {
		let txHash
		Splitter.deployed()
			.then(_instance => {
				return myContract.kill.sendTransaction({from:alice})
			})
			.then(_txHash => {
				txHash = _txHash
				return myContract.split.sendTransaction({from:alice,value:evenAmount})
			})
			.catch(function(error) {
				assert.isString(txHash, "failed to return txHash from killing the contract");
				assert.strictEqual(error.toString().slice(0,60), "Error: VM Exception while processing transaction: revert");
				done()
			})
			.catch(done)
	})
})
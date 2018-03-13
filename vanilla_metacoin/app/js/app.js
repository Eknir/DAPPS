const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
require("file-loader?name=../index.html!../index.html");
// Not to forget our built contract
const metaCoinJson = require("../../build/contracts/MetaCoin.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 == 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

//promisify web3.eth
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

//prepare MetaCoin contract
const MetaCoin = truffleContract(metaCoinJson);
MetaCoin.setProvider(web3.currentProvider);

// discover the account we connected to and update the balance accordingly
window.addEventListener('load', function() {
	return web3.eth.getAccountsPromise()
	.then(accounts => {
		if (accounts.length == 0) {
			$("#balance").html("N/A");
			throw new Error("No accounts with which to transact");
		}
		window.account = accounts[0];

		return web3.version.getNetworkPromise();
	})
	.then(network => {
		console.log("Network", network.toString(10));
		return MetaCoin.deployed();
	})
	.then(deployed => deployed.getBalance.call(window.account))
	.then(balance => $("#balance").html(balance.toString(10)))
	.then(() => $("#send").click(sendCoin))
	.catch(console.error);
});

const sendCoin = function() {
	const gas = 300000; let deployed;
	// return the whole promise chain so that parts of the UI can be informed when done
	return MetaCoin.deployed()
	// simulate the real call
		.then(_deployed => {
			return _deployed.sendCoin.call(
				$("input[name='recipient']").val(),
				$("input[name='amount']").val(),
				{ from: window.account, gas: gas });
		})
		.then(success => {
			if (!success) {
				throw new Error("The transaction will fail anyway, not sending");
			}
			// move on to proper action
			//.sendTransaction so we get the txHash immediately 
			return deployed.sendCoin.sendTransaction(
				$("input[name='recipient']").val(),
				$("input[name='amount']").val(),
				{ from: window.account, gas: gas });
		})
		.then(txHash => {
			$("#status").html("Transaction on the way " + txHash);
			const tryAgain = () => web3.eth.getTransactionReceipt(txHash)
				.then(receipt => receipt !== null ?
					receipt :
					Promise.delay(1000).then(tryAgain));
				return tryAgain();
		})
		.then(receipt => {
			if (receipt.logs.length == 0) {
				console.error("Empty logs");
				console.error(receipt);
				$("#status").html("There was an error in the tx execution");
			} else {
			// format the event nicely
				console.log(receipt.logs[0].args);
				$("#status").html("Transfer executed");
			}
			//update UI
			return deployed.getBalance.call(window.account)
		})
		.then(balance => $("#balance").html(balance.toString(10)))
		.catch(e => {
			$("#status").html(e.toString());
			console.error(e);
		});
};

console.log(MetaCoin);
console.log(MetaCoin.deployed())
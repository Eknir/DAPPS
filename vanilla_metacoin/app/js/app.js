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
    // We wire it when the system looks in order.
    .then(() => $("#send").click(sendCoin))
    // Never let an error go unlogged.
    .catch(console.error);
});

const sendCoin = function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000; let deployed;
    // We return the whole promise chain so that other parts of the UI can be informed when
    // it is done.
    return MetaCoin.deployed()
        .then(_deployed => {
            deployed = _deployed;
            // We simulate the real call and see whether this is likely to work.
            // No point in wasting gas if we have a likely failure.
            return _deployed.sendCoin.call(
                $("input[name='recipient']").val(),
                // Giving a string is fine
                $("input[name='amount']").val(),
                { from: window.account, gas: gas });
        })
        .then(success => {
            if (!success) {
                throw new Error("The transaction will fail anyway, not sending");
            }
            // Ok, we move onto the proper action.
            // .sendTransaction so that we get the txHash immediately while it 
            // is mined, as, in real life scenarios, that can take time of 
            // course.
            return deployed.sendCoin.sendTransaction(
                $("input[name='recipient']").val(),
                // Giving a string is fine
                $("input[name='amount']").val(),
                { from: window.account, gas: gas });
        })
        // We would be a proper `txObject` if we had not added `.sendTransaction` above.
        // Oh well, more work is needed here for our user to have a nice UI.
        .then(txHash => {
            $("#status").html("Transaction on the way " + txHash);
            // Now we wait for the tx to be mined. Typically, you would take this into another
            // module, as in https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
            const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
                .then(receipt => receipt !== null ?
                    receipt :
                    // Let's hope we don't hit the max call stack depth
                    Promise.delay(1000).then(tryAgain));
            return tryAgain();
        })
        .then(receipt => {
            if (receipt.logs.length == 0) {
                console.error("Empty logs");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution");
            } else {
                // Format the event nicely.
                console.log(deployed.Transfer().formatter(receipt.logs[0]).args);
                $("#status").html("Transfer executed");
            }
            // Make sure we update the UI.
            return deployed.getBalance.call(window.account);
        })
        .then(balance => $("#balance").html(balance.toString(10)))
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
};
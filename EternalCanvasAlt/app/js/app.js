require("file-loader?name=../index.html!../index.html");

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const eternalCanvasJson = require("../../build/contracts/EternalCanvas.json");
const ownableJson = require("../../build/contracts/Ownable.json");

//FOR DEVELPMENT we don't use METAMASK, however, for production we have to add !
// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 == 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

//promisify for convenience
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

//get the contracts
const EternalCanvas = truffleContract(eternalCanvasJson);
const Ownable = truffleContract(ownableJson);

//set provider
EternalCanvas.setProvider(web3.currentProvider);
Ownable.setProvider(web3.currentProvider);


window.addEventListener('load', function() {
	//TODO click for draw pixel?
	let canvas = $("#canvas");
    return web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length == 0) {
                $("#address").html("N/A");
                throw new Error("No account with which to transact");
            }
            else {
            	$("#address").html(accounts[0]);
            }
            window.account = accounts[0];
            return web3.version.getNetworkPromise();
        })
        .then(network => {
            console.log("Network:", network.toString(10));
            // get instance of EternalCanvas
            return EternalCanvas.deployed();
        })
        .then(instance => {
        	//Do Something
        })
        .catch(console.error);
 });


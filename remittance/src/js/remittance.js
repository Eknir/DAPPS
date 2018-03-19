const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
require("file-loader?name=../index.html!../index.html");
// Not to forget our built contract
const remittanceJson = require("../../build/contracts/Remittance.json");


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
const Remittance = truffleContract(remittanceJson);
Remittance.setProvider(web3.currentProvider);

let account;

function createRemittance(_values) {
    const exchange = _values[0].value;
    const secret1Hash = _values[1].value;
    const secret2Hash = _values[2].value;
    const duration = _values[3].value;
    const value = _values[4].value;

    console.log(exchange, secret1Hash, secret2Hash, duration, value)

    Remittance.deployed()
    .then(deployed => {
        deployed.createRemittance(exchange, secret1Hash, secret2Hash, duration, {from: account, gas: 200000, value: web3.toWei(value, "ether")});
    });
}

function solveRemittance(_values) {
    const contractId = values[0].value;
    const secret1 = values[1].value;
    const secret2 = values[2].value;

    Remittance.deployed()
    .then(deployed => {
        deployed.solveRemittance(contractId, secret1, secret2)
    })
}

// discover the account we connected to and update the balance accordingly
window.addEventListener('load', function() {

    let instance;
    let accounts;
    Remittance.deployed()
    .then(_instance => {
        instance = _instance;

        if(instance.address == undefined) {
            $("#contractAddress").html("N/A");
            throw new Error("Contract address could not be found");
        }

        $("#contractAddress").html("Contract address: " + instance.address);

        return web3.eth.getAccountsPromise();
        })

    .then(_accounts => {
        accounts = _accounts;
        account = accounts[0];
        if(accounts.length == 0) {
            $("#account").html("N/A");
            throw new Error("No accounts to interact with");
        }
        $("#account").html("Interacting from account: " + account);
       
       for(var i = 0; i < 4; i+=1) {
        instance.getRemittance(account, i, {from:account}) 
                .then(result => {
                    let nullAddress = "0x0000000000000000000000000000000000000000";
                    if(result[0] != nullAddress) {
                        // update the inner HTML of contracts such that all contracts are displayed.
                    }
                })
            }

    

    })


    $("#setupForm").submit(function() {
        var values = $(this).serializeArray();
        createRemittance(values); 
    })
    
    $("#claimForm").submit(function() {
        var values = $(this).serializeArray();
        solveRemittance(values);
    });


});
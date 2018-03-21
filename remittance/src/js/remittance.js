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
    const secretsHash = _values[1].value;
    const duration = _values[2].value;
    const value = _values[3].value;

    console.log(_values);

    Remittance.deployed()
    .then(deployed => {

        console.log("duration:", Number(duration));
        deployed.createRemittance(exchange, secretsHash, duration, {from: account, gas: 200000, value: web3.toWei(value, "ether")});
    });
};

function solveRemittance(_values) {
    const nonce = _values[0].value;
    const sender = _values[1].value;
    const secret1 = _values[2].value;
    const secret2 = _values[3].value;

    Remittance.deployed()
    .then(deployed => {
        deployed.solveRemittance(nonce, secret1, secret2, sender, {from:account})
    });
};

function retrieveRemittance(_values) {
    const nonce = _values[0].value;
    const exchange = values[1].value;
    const secret1 = _values[2].value;
    const secret2 = _values[3].value;

    Remittance.deployed()
    .then(deployed => {
        deployed.retrieveRemittance(nonce, secret1, secret2, exchange, {from: account});
    });

};

window.addEventListener('load', function() {

    let instance;
    Remittance.deployed()
    .then(_instance => {
        instance = _instance;

        if(instance.address == undefined) {
            $("#contractAddress").html("N/A");
            throw new Error("Contract address could not be found");
        }

        $("#contractAddress").html("Contract address: " + instance.address);

        // event listeners
        var RemittanceCreated = instance.LogRemittanceCreated({sender: account}, {fromBlock:0, toBlock: 'latest'}).watch(function(error, response) {
            if(!error) {
                var existingHTML = $("#created").html();
                console.log("Duration", response.args._duration.toString(10), "Block:", response.blockNumber);
                console.log(response)
                $("#created").html(
                    existingHTML + 
                    "<div>Contract number: " + response.args._nonce.toNumber(10) + 
                    "<br>Block number created: " + response.blockNumber +
                    "<br>Deadline at block number: " + (response.args._duration.toNumber(10) + response.blockNumber) +
                    "<br>Exchange Address: " + response.args._exchange + 
                    "<br>Secrets hash: " + response.args._secretsHash + 
                    "<br>Value:" + response.args._value.toNumber(10) +
                    "<br><br></div>"
                    );
            }      
        });

        var RemittanceSolved = instance.LogRemittanceSolved({_sender: account}, {fromBlock:0, toBlock: 'latest'}).watch(function(error, response) {
            if(!error) {
                var existingHTML = $("#solved").html();

                $("#solved").html(
                    existingHTML +
                    "<div>Contract number: " + response.args._nonce.toNumber(10) + 
                    "<br>At block: " + response.blockNumber +
                    "</div>"
                    );                    
            }
        });

        var RemittanceRetrieved = instance.LogRemittanceRetrieved({_sender: account}, {fromBlock:0, toBlock: 'latest}'}).watch(function(error, response) {
            if(!error) {
                var existingHTML = $("retrieved").html();

                $("retrieved").html(
                    existingHTML +
                    "<div>Contract number" + response.args._nonce.toNumber(10) + 
                    "<br>At block: " + response.blockNumber + 
                    "</div>"
                    );
            }
        });

        return web3.eth.getAccountsPromise();
        })

    .then(_accounts => {
        account = _accounts[0];
        if(_accounts.length == 0) {
            $("#account").html("N/A");
            throw new Error("No accounts to interact with");
        }
        $("#account").html("Interacting from account: " + account);
        })

    
    $("#createForm").submit(function(e) {
        e.preventDefault();
        var values = $(this).serializeArray();
        $("#createForm")[0].reset();
        createRemittance(values); 
    })
    
    $("#solveForm").submit(function(e) {
        e.preventDefault();
        $("#solveForm")[0].reset();
        var values = $(this).serializeArray();
        solveRemittance(values);
    });

    $("#retrieveForm").submit(function(e) {
        e.preventDefault();
        $("#retrieveForm")[0].reset();
        var values = $(this).serializeArray();
        retrieveRemittance(values); 
    })


});
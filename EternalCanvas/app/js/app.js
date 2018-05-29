require("file-loader?name=../index.html!../index.html");

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const eternalCanvasJson = require("../../build/contracts/EternalCanvas.json");
const ownableJson = require("../../build/contracts/Ownable.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
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

function purchaseRight(time, bidPrice) {
    return EternalCanvas.deployed()
    .then(instance => instance.purchaseRight(time, {from: account, value: web3.toWei(bidPrice, 'ether'), gas: 100000}))
}

function draw(time, color, position) {
	return EternalCanvas.deployed()
    .then(instance => instance.draw(time, color, position, {from: account, gas: 100000}))
}

//draw event handler

$("#getDrawData").submit(function(e) {
	e.preventDefault()
	index = this.elements[0].value;
	time = this.elements[1].value;
	color= this.elements[2].value;
	draw(time, color, position)
	
})


$("#getPurchaseData").submit(function(e) {
		e.preventDefault()
		time = this.elements[0].value;
		bidPrice = this.elements[1].value;
		purchaseRight(time, bidPrice);
	})

let pixels = new Array();
window.addEventListener('load', function() {
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
        	// fill array with all pixels
        	let i = 0;
        	for(i; i<9; i++) {
        		//call to the ethereum public variable pixels (with argument i)
        		instance.pixels.call(i)
        		.then(pixel => {
        			pixels.push(pixel);
        		})
        	}
        	//this is how we create an event watcher. Note that we are filtering on potentialArtist: account
        	instance.logBidPlaced({potentialArtist: account}, {fromBlock:0, toBlock: "latest"}).watch(function(error, response) {
        		if(!error) {
					console.log("This is the response from an event watcher: ", response);
					let par = document.createElement("P");
					let par1 = document.createElement("P");
					let time = document.createTextNode(response.args.time.toString(10));
					let bid = document.createTextNode(web3.fromWei(response.args.bid, "ether"));
					par.appendChild(time);
					par1.appendChild(bid);
					
					$("#outstandingBids").append(par);
					$("#outstandingBids").append(par1);
        		}
        		else {
        			console.error("Unable to retrieve events for logBidPlaced")
        		}
        		
        	})
        	//TODO! Filter on artist = account
        	instance.logPixelDrawn({})

        })
        // Never let an error go unlogged.
        .catch(console.error);
 });


console.log(document.getElementById("canvas"))


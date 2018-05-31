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

function purchaseRight(time, bidPrice) {
    return EternalCanvas.deployed()
    //TODO! Gas amount?
    .then(instance => instance.purchaseRight(time, {from: account, value: web3.toWei(bidPrice, 'ether'), gas: 100000}))
}

function drawPixel(time, color, position) {
	return EternalCanvas.deployed()
	//TODO! Gas amount?
    .then(instance => instance.draw(time, color, position, {from: account, gas: 100000}))
}

async function drawCanvas(instance) {
   	const diameter = 10
	// initialize canvas
	var doc = document;
	canvas = doc.getElementById("canvas");
	canvas.innerHTML = "Loading canvas...";
	var fragment = doc.createDocumentFragment(); 
	for (i = 0; i < diameter; i++) {
		var tr = doc.createElement("tr");
    	for (j = 0; j < diameter; j++) {
    		var td = doc.createElement("td");
    		argument = parseInt((i.toString() + j.toString()))
    		td.innerHTML = argument;
    		color = await instance.pixels.call((argument))
    		if(color == 0x00) {
    			td.style.background= 'Red';
    		}
    		else if(color == 0x01) {
    			td.style.background= 'Green';
    		}
    		else {
    			td.style.background= 'Blue';
    		}
    		tr.appendChild(td);
	    }
    		//does not trigger reflow
   		fragment.appendChild(tr);
	}
	var table = doc.createElement("table");
	table.style.width = 500;
	table.style.height = 500;
	table.appendChild(fragment);
	canvas.innerHTML = "";
	canvas.appendChild(table);
}

$("#drawData").submit(function(e) {
	e.preventDefault()
	index = this.elements[0].value;
	time = this.elements[1].value;
	color= this.elements[2].value;
	drawPixel(time, color, index)
	
})

$("#purchaseData").submit(function(e) {
		e.preventDefault()
		time = this.elements[0].value;
		bidPrice = this.elements[1].value;
		purchaseRight(time, bidPrice);
	})

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
        	console.log(instance.pixels.call(55))

        	drawCanvas(instance);
        	console.log("Contract Address: " + instance.address)
        	//let time = new Date(year, month, day, hour, minutes)
        	//console.log(time)
        	let ts = Math.round(Date.now() / 1000);
        	let mod = ts % 60
        	ts = ts - mod
        	$("#ts").html("current UTC timestamp (rounded to minutes): " + ts);

        	//this is how we create an event watcher. Note that we are filtering on potentialArtist: account
        	instance.logBidPlaced({potentialArtist: account}, {fromBlock:0, toBlock: "latest"}).watch(function(error, response) {
        		if(!error) {
					console.log("This is the response from logBidPlaced: ", response);
					//TODO! Better?
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
        			console.error("Unable to retrieve event for logBidPlaced")
        		}
        		
        	})
        	//TODO! Filter on artist = account
        	instance.logPixelDrawn({}, {fromBlock:0, toBlock: "latest"}).watch(function(error, response) {
        		if(!error) {
        			console.log("This is the response from logPixelDrawn: ", response);
        			//TODO: Update canvas
        		}
        		else {
        			console.error("Unable to retrieve event for logPixelDrawn")
        		}
        			
        	})
        })
        // Never let an error go unlogged.
        .catch(console.error);
 });


console.log(document.getElementById("canvas"))


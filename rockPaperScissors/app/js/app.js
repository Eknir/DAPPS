// TODO, see if we can write things down neater
// TODO, directly reply if an opponent wants to play against you? < too much work for now
// TODO, 

const Web3 = require("web3");
const Web3Utils = require('web3-utils');
console.log(Web3Utils);
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
require("file-loader?name=../index.html!../index.html");
// Not to forget our built contract
const RockPaperScissorsJson = require("../../build/contracts/RockPaperScissors.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

const RockPaperScissors = truffleContract(RockPaperScissorsJson);
RockPaperScissors.setProvider(web3.currentProvider);


// interacting functions
function newPlay(_values) {
	console.log("newPlay")
	let move = _values[0].value;
	let secret = _values[1].value;
	let secondPlayer = _values[2].value;
	let bet = _values[3].value;

	if(!(Web3Utils.isAddress(secondPlayer) || secondPlayer == 0x0)) {
		$("#newPlayError").html("Invalid Address")
	} else {
		let hiddenMove = Web3Utils.soliditySha3({type: 'uint8', value: move}, {type: 'string', value: secret});
		RockPaperScissors.deployed()
		.then(deployed => {
			return deployed.newPlay(hiddenMove, secondPlayer, {from: accounts[0], value: web3.toWei(bet, 'ether')} )
		})
		.then(txHash => {
			console.log(txHash.tx);
		});
	}
}

function acceptPlay(_values) {
	let move = _values[0].value;
	let opponent = _values[1].value;
	let bet;

	if(!Web3Utils.isAddress(opponent)) {
		$("#acceptPlayError").html("Invalid Address")
	} else {
		RockPaperScissors.deployed()
		.then(deployed => {
			deployed.games.call(opponent)
				.then(games => { 
					bet = games[1].toString(10);	
					return deployed.acceptPlay(opponent, move, {from: accounts[0], value: bet} )
				})
				.then(txHash => {
				console.log(txHash.tx);
			})
		});
	}
}

function finishPlay(_values) {
	let secret = _values[0].value;
	let move = _values[1].value;

	RockPaperScissors.deployed()
	.then(deployed => {
		return deployed.finishPlay(secret, move, {from: accounts[0]})
	})
	.then(txHash => {
		console.log(txHash.tx);
	});
}

function claimPrize() {
	RockPaperScissors.deployed()
	.then(deployed => {
		deployed.claimPrize({from:accounts[0]})
	})
	.then(txHash => {
		console.log(txHash.tx);
	});
}

function withdrawGame(_values) {
	console.log('withdrawgame')
	let firstPlayer = _values[0].value;
	if(!Web3Utils.isAddress(firstPlayer)) {
		$("#withdrawGameError").html("Invalid Address")
	} else {
		console.log('no false address')
		RockPaperScissors.deployed()
		.then(deployed => {
			return deployed.withdrawGame(firstPlayer, {from:accounts[0]})
		})
		.then(txHash => {
			console.log(txHash.tx);
		});
	}
}
// end of interacting functions

let accounts;
window.addEventListener('load', function() {	

	// initializes account
	web3.eth.getAccountsPromise()
		.then(_accounts => {
			accounts = _accounts;

			// shows account on page
			$("#account").html("Interacting from account: " + accounts);
	return RockPaperScissors.deployed();
	})
	.then(instance => {

		// shows contract address on page
		$("#contractAddress").html("Contract address: " + instance.address);

		// shows claim prize button if possible for account to claim anything
		instance.balances.call(accounts[0])
			.then(_balance => {
				let balance = web3.fromWei(_balance, 'ether').toNumber(10);
				$("#balances").html("Claimable Ether: " + balance);
				if(balance != 0) {
					$("#claimPrize").css("visibility", "visible")
				}
		})

		// form submit watchers
		$("#newPlay").submit(function(e) {
			e.preventDefault();
			var values = $(this).serializeArray();
			$("#newPlay")[0].reset();
			newPlay(values);
		})

		$("#acceptPlay").submit(function(e) {
			e.preventDefault();
			var values = $(this).serializeArray();
			$("#acceptPlay")[0].reset();
			acceptPlay(values);
		})

		$('#finishPlay').submit(function(e) {
			e.preventDefault();
			var values = $(this).serializeArray();
			$("#finishPlay")[0].reset();
			finishPlay(values);
		})

		$('#claimPrize').click(function() {
			claimPrize();
		})

		$('#withdrawGame').submit(function(e) {
			e.preventDefault();
			var values = $(this).serializeArray();
			$("#withdrawGame")[0].reset();
			withdrawGame(values);
		})
		// end of form submit watchers

		// event watchers
		instance.logNewPlay({}, {fromBlock:0, toBlock: 'latest'}).watch(function(error, response) {
            if(!error) {

            	// get information about the game
            	let firstPlayer = response.args._firstPlayer;
            	let stage
            	let bet;
            	let initialTime;
            	let secondPlayer;;
            	let secondTime;

            	instance.games.call(firstPlayer)
            		.then(games => { 
						stage = games[0].toString(10);
						bet = web3.fromWei(games[1],'ether').toString(10);
						initialTime = games[3].toString(10);
						secondPlayer = games[5].toString(10);
						secondTime = games[6].toString(10);
				
					// these games are not initialized by account[0
            		if(firstPlayer != accounts[0]) {          		

							// these games can be accepted
						if(stage == 1 && (secondPlayer == accounts[0] || secondPlayer == 0x0000000000000000000000000000000000000000)) {
               				$("#stage1").html("first Player: " + firstPlayer +
               									"<br>Bet: " + bet +
               									"eth <br> Initialized at Block Number" + initialTime);

               				// these games are accepted
           				} else if(stage == 2 && secondPlayer == accounts[0]) {
           					$('#outstanding').html("first Player: " + firstPlayer +
           										"<br>Bet: " + bet +
            									"eth <br>Last move by you at block Number: " + secondTime +
               									"<br>Stage: " + stage);
               			}
               		}
            	
               		// these games are initialized by account[0]
            		else {
            			console.log("initialized by you")
            			console.log(response.args)
            			if(stage == 1) {
            				let player;
            				if(secondPlayer == 0x0000000000000000000000000000000000000000) player = 'anybody'
            				else player = secondPlayer;
               				console.log("stage == 1" + response)
               				$('#outstanding').html("first Player: you <br>Bet: " + bet +
               										"<br>Initialized at Block Number" + initialTime +
               										"<br>opponent: " + player);
               			} else if(stage == 2) {
               				$('#stage2').html("first Player: you <br>Bet: " + bet +
               								"eth <br>Last move by " + secondPlayer + " at " + secondTime);
               			}
            		}	
        		});
            }
    	});
    	// end of event watchers
	});
});
        
    
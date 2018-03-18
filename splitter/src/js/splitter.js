// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}
//initialize
const splitterAddress = "0x17651530d6863cdce03bd7e709ec92199c999710"; // <-- changes every deploymenbt!

var splitterContract = web3.eth.contract(abiArray);
var splitter = splitterContract.at(splitterAddress);

// contract calls 
function getBalance() {
    web3.eth.getBalance(splitterAddress, 
        function(error, result) { 
            if(!error) {
            document.getElementById("balance").innerHTML = result;
            }
            else {
                console.log(error);
            }
        });
}

function getIndividualBalance() {
    let balAlice, balBob, balCarol;
    splitter.getIndividualBalance(function(error, balances) {
        if(!error) {
        balAlice = balances[0];
        balBob = balances[2];
        balCarol = balances[4];
        document.getElementById("individualBalance").innerHTML = "Alice: " + balAlice + " Bob: " + " " + balBob + " Carol: " + balCarol;
        } else {
            console.log("Error: ", error)
        }
    });
}

function split(_value) {
    var value = _value;
    if(value <= 0) {
        console.log("error")
        document.getElementById("errorSplit").innerHTML = "Give a positive number";
        return
    } else {
        document.getElementById("errorSplit").innerHTML = "";
    }
    web3.eth.getAccounts(function(error, accounts) {
        if(!error) {
            var sender = accounts[0];
            splitter.split.sendTransaction({from: sender, value: value, gas: 2500000}, function(error, result) {
                if(!error) {
                    console.log("success: ",result)

                } else {
                    console.log("Error: ", error);
                }
            });
        } else {
            console.log("Error:  ", error);
        }
    });
}



function withdraw() {
    web3.eth.getAccounts(function(error, accounts) {
        if(!error) {
            // make sure that the withdraw function is performed by the correct person
            // withdraw
            splitter.withdraw({from: web3.eth.accounts[0], gas: 40000}, function(error, result) {
                if(!error) {
                    console.log(result);
                } else {
                    console.log(error);
                }
            });
        } else {
            console.log(error)
        }
    });
}

function kill() {
    splitter.kill(function(err,result) {
        if(err) {
                console.log(err)
            } else {
                console.log(result)
            }
        });
}
 
window.onload = function() {
    getBalance();
    getIndividualBalance();
    document.getElementById('split')

    .addEventListener('submit', function() {
        var value = document.getElementById('value');
        split(parseInt(value.value));
        value.value = "";
    });
    
    document.getElementById('withdraw')
    .addEventListener('submit', function() {
        withdraw();
    });
    document.getElementById('kill')
    .addEventListener('submit', function() {
        kill()
    });

}

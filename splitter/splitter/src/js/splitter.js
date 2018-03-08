
// set web3 Provider
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//initialize
const splitterAddress = "0xfd294c3aaa3f1cc394c24f924fdbcb4e18248679"; // <-- changes every deploymenbt!

var splitterContract = web3.eth.contract(abiArray);
var splitter = splitterContract.at(splitterAddress);

// contract calls (alphabetical order)
function getBalance() {
    web3.eth.getBalance(splitterAddress, 
        function(err, result) { 
            if(!err) {
            document.getElementById("balance").innerHTML = result;
            }
            else {
                console.log(err);
            }
        });
}

function getIndividualBalance() {
    //splitter.getIndividualBalance()
    var balanceAlice = splitter.getIndividualBalance()[0].toNumber();
    var balanceBob = splitter.getIndividualBalance()[2].toNumber();
    var balanceCarol = splitter.getIndividualBalance()[4].toNumber();
    document.getElementById("individualBalance").innerHTML = "Alice: " + balanceAlice + " Bob: " + " " + balanceBob + " Carol: " + balanceCarol;
    console.log(splitter.getIndividualBalance())
}

function split(_value) {
    var result = splitter.split({from: web3.eth.accounts[0], value: _value});
    return result;
}

function withdraw(_person) {
    if(_person == "alice") {
        person = web3.eth.accounts[0];
    }
    else if(_person == "bob") {
        person = web3.eth.accounts[1];
    }
    else {
        person = web3.eth.accounts[2];
    }

    var result = splitter.withdraw({from: person});  
    return result;
}

// event listeners
window.onload = function() {
    document.getElementById('split').addEventListener('submit', function() {
        split(parseInt(document.getElementById('value').value))
    });
    document.getElementById('withdraw').addEventListener('submit', function() {
        withdraw(document.getElementById('person').value);
    });
}



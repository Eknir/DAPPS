
// set web3 Provider
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//initialize
const splitterAddress = "0x97f120bd2a24d1f091ceb104c6e0a2c4d00d38ba"; // <-- changes every deploymenbt!
var splitterContract = web3.eth.contract(abiArray);
var splitter = splitterContract.at(splitterAddress);

// contract calls (alphabetical order)
function getBalance() {
    var balance = splitter.getBalance();
    document.getElementById("balance").innerHTML = balance;
}

function getIndividualBalance() {
    var balanceAlice = splitter.getIndividualBalance()[0].toNumber();
    var balanceBob = splitter.getIndividualBalance()[2].toNumber();
    var balanceCarol = splitter.getIndividualBalance()[4].toNumber();
    document.getElementById("individualBalance").innerHTML = "Alice: " + balanceAlice + " Bob: " + " " + balanceBob + " Carol: " + balanceCarol;
    console.log(splitter.getIndividualBalance())
}

function split(_value) {
    splitter.split({from: web3.eth.accounts[0], value: _value});
}

function withdraw(_person) {
    var person = _person;
    if(person == "bob") {
        person = web3.eth.accounts[1];
    }
    else {
        person = web3.eth.accounts[2];
    }
    splitter.withdraw({from: person});
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



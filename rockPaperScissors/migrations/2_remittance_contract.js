var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

module.exports = function(deployer) {
var duration = web3.toBigNumber(10);
console.log("Deploying with duration of ", duration + " Blocks");

	deployer.deploy(RockPaperScissors, duration);
};

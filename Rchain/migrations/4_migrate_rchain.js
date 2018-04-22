var Rchain = artifacts.require("./Rchain.sol");

module.exports = function(deployer) {
	deployer.deploy(Rchain);
};
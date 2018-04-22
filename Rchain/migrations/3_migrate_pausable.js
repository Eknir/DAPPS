var Pausable = artifacts.require("./Pausable.sol");

module.exports = function(deployer) {
	deployer.deploy(Pausable);
};
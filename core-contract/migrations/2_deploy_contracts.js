// Libraries imports
var ECRecovery = artifacts.require("../node_modules/zeppelin-solidity/contracts/ECRecovery.sol");
var SafeMath = artifacts.require("../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol");

// Contracts imports
var SmartOrder = artifacts.require("./SmartOrder.sol");

module.exports = (deployer) => {

	// Libraries
	deployer.deploy(ECRecovery);
	deployer.deploy(SafeMath);

	// Contracts
	deployer.link(ECRecovery, SmartOrder);
	deployer.link(SafeMath, SmartOrder);
	deployer.deploy(SmartOrder);
}
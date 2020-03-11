const Oracle = artifacts.require("Oracle");
const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Oracle, 10000, 20000);
};

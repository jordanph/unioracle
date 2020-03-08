const Oracle = artifacts.require("Oracle");

contract("Oracle", async accounts => {
  it("owner should be the contract creator", async () => {
    let instance = await Oracle.deployed();

    let owner = await instance.getOwner.call();

    assert.equal(owner, accounts[0]);
  });
});

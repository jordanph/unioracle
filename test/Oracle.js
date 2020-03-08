const Oracle = artifacts.require("Oracle");
const truffleAssert = require("truffle-assertions");

contract("Oracle", async accounts => {
  const initialRequestAmount = 10000; // From initial_migration file

  describe("initial deployment should correctly set", () => {
    it("request amount", async () => {
      const instance = await Oracle.deployed();

      const requestAmount = await instance.requestAmount();

      assert.equal(requestAmount, initialRequestAmount);
    });
  });

  describe("requesting data", () => {
    it("should return data if correct amount of ETH is sent", async () => {
      const instance = await Oracle.deployed();

      const data = await instance.requestData.call({
        value: initialRequestAmount
      });

      assert.equal(data, 123);
    });

    describe("should throw error", () => {
      it("when incorrect amount of ETH is sent", async () => {
        const instance = await Oracle.deployed();

        const requestWithTooFewEth = instance.requestData.call({
          value: initialRequestAmount - 100
        });

        await truffleAssert.reverts(
          requestWithTooFewEth,
          "You must send the request amount to get the data!"
        );
      });

      it("when no amount of ETH is sent", async () => {
        const instance = await Oracle.deployed();

        const requestWithNoEth = instance.requestData.call({
          value: initialRequestAmount - 100
        });

        await truffleAssert.reverts(
          requestWithNoEth,
          "You must send the request amount to get the data!"
        );
      });
    });
  });
});

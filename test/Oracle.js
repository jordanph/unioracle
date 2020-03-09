const Oracle = artifacts.require("Oracle");
const truffleAssert = require("truffle-assertions");

contract("Oracle", async accounts => {
  // From initial_migration file
  const initialRequiredStakeAmount = 10000;
  const initialRequestAmount = 20000;

  describe("initial deployment should correctly set", () => {
    it("request amount", async () => {
      const instance = await Oracle.deployed();

      const requestAmount = await instance.requestAmount();

      assert.equal(requestAmount, initialRequestAmount);
    });
    it("required stake amount", async () => {
      const instance = await Oracle.deployed();

      const requiredStakeAmount = await instance.requiredStakeAmount();

      assert.equal(requiredStakeAmount, initialRequiredStakeAmount);
    });
  });

  describe("beginning to stake", () => {
    it("should add sender to the pending stakers", async () => {
      const instance = await Oracle.deployed();

      const stakingAccount = accounts[1];

      await instance.submitIntentionToStake({
        value: initialRequiredStakeAmount,
        from: stakingAccount
      });

      const staking = await instance.pendingStakers(stakingAccount);

      assert.equal(staking, true);
    });

    describe("should throw error", () => {
      it("when incorrect amount of ETH is sent", async () => {
        const instance = await Oracle.deployed();

        const requestWithTooFewEth = instance.submitIntentionToStake({
          value: initialRequiredStakeAmount - 100
        });

        await truffleAssert.reverts(
          requestWithTooFewEth,
          "You must the required amount to begin staking!"
        );
      });

      it("when no amount of ETH is sent", async () => {
        const instance = await Oracle.deployed();

        const requestWithNoEth = instance.submitIntentionToStake({
          value: initialRequiredStakeAmount - 100
        });

        await truffleAssert.reverts(
          requestWithNoEth,
          "You must the required amount to begin staking!"
        );
      });
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

        const requestWithTooFewEth = instance.requestData({
          value: initialRequestAmount - 100
        });

        await truffleAssert.reverts(
          requestWithTooFewEth,
          "You must send the request amount to get the data!"
        );
      });

      it("when no amount of ETH is sent", async () => {
        const instance = await Oracle.deployed();

        const requestWithNoEth = instance.requestData({
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

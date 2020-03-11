const Oracle = artifacts.require("Oracle");
const truffleAssert = require("truffle-assertions");

contract("Oracle", async accounts => {
  // From initial_migration file
  const initialRequiredStakeAmount = 10000;
  const initialRequestAmount = 20000;
  const INACTIVE_enum = 0;
  const PENDING_enum = 1;
  const ACTIVE_enum = 2;

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
    it("initial total minted supply to 0", async () => {
      const instance = await Oracle.deployed();

      const totalMintedSupply = await instance.totalMintedSupply();

      assert.equal(totalMintedSupply, 0);
    });
    it("intial total stake intention supply to 0", async () => {
      const instance = await Oracle.deployed();

      const totalStakeIntentionSupply = await instance.totalStakeIntentionSupply();

      assert.equal(totalStakeIntentionSupply, 0);
    });
  });

  describe("beginning to stake", () => {
    it("should set sender to PENDING", async () => {
      const instance = await Oracle.new(
        initialRequiredStakeAmount,
        initialRequestAmount
      );

      const stakingAccount = accounts[1];

      await instance.submitIntentionToStake({
        value: initialRequiredStakeAmount,
        from: stakingAccount
      });

      const staking = await instance.stakers(stakingAccount);

      assert.equal(staking, PENDING_enum);
    });

    it("should increase totalStakeIntentionSupply by stake amount for each pending user", async () => {
      const instance = await Oracle.new(
        initialRequiredStakeAmount,
        initialRequestAmount
      );

      const stakingAccount1 = accounts[1];
      const stakingAccount2 = accounts[2];
      const stakingAccount3 = accounts[3];

      await instance.submitIntentionToStake({
        value: initialRequiredStakeAmount,
        from: stakingAccount1
      });

      await instance.submitIntentionToStake({
        value: initialRequiredStakeAmount,
        from: stakingAccount2
      });

      await instance.submitIntentionToStake({
        value: initialRequiredStakeAmount,
        from: stakingAccount3
      });

      const stakingSupply = await instance.totalStakeIntentionSupply();

      assert.equal(stakingSupply.toNumber(), initialRequiredStakeAmount * 3);
    });

    describe("should throw error", () => {
      it("when incorrect amount of ETH is sent", async () => {
        const instance = await Oracle.deployed();

        const requestWithTooFewEth = instance.submitIntentionToStake({
          value: initialRequiredStakeAmount - 100
        });

        await truffleAssert.reverts(
          requestWithTooFewEth,
          "You must send the required amount to begin staking!"
        );
      });

      it("when no amount of ETH is sent", async () => {
        const instance = await Oracle.deployed();

        const requestWithNoEth = instance.submitIntentionToStake({
          value: initialRequiredStakeAmount - 100
        });

        await truffleAssert.reverts(
          requestWithNoEth,
          "You must send the required amount to begin staking!"
        );
      });

      it("when sender is already pending", async () => {
        const instance = await Oracle.deployed();

        await instance.submitIntentionToStake({
          value: initialRequiredStakeAmount
        });

        const alreadyPendingStakerRequest = instance.submitIntentionToStake({
          value: initialRequiredStakeAmount
        });

        await truffleAssert.reverts(
          alreadyPendingStakerRequest,
          "You must not be in a pending or active state."
        );
      });

      it("when sender is active", async () => {
        const instance = await Oracle.deployed();

        await instance.activateStake();

        const requestWithNoEth = instance.submitIntentionToStake({
          value: initialRequiredStakeAmount
        });

        await truffleAssert.reverts(
          requestWithNoEth,
          "You must not be in a pending or active state."
        );
      });
    });
  });

  describe("activating staking", () => {
    let instance;
    const stakingAccount = accounts[1];

    beforeEach(async () => {
      instance = await Oracle.new(
        initialRequiredStakeAmount,
        initialRequestAmount
      );

      await instance.submitIntentionToStake({
        value: initialRequiredStakeAmount,
        from: stakingAccount
      });
    });

    it("should decrease the total stake intention supply", async () => {
      await instance.activateStake({
        from: stakingAccount
      });

      const totalStakeIntentionSupply = await instance.totalStakeIntentionSupply();

      assert.equal(totalStakeIntentionSupply, 0);
    });

    describe("by the first staker should", () => {
      beforeEach(async () => {
        await instance.activateStake({
          from: stakingAccount
        });
      });
      it("set totalMintedSupply to user's stake amount", async () => {
        const totalMintedSupply = await instance.totalMintedSupply();

        assert.equal(totalMintedSupply, initialRequiredStakeAmount);
      });

      it("set balance of the user as their stake amount", async () => {
        const balanceOf = await instance.balanceOf(stakingAccount);

        assert.equal(balanceOf, initialRequiredStakeAmount);
      });
    });

    describe("by subsequent stakers should", () => {
      const anotherStakingAccount = accounts[2];

      beforeEach(async () => {
        await instance.submitIntentionToStake({
          value: initialRequiredStakeAmount,
          from: anotherStakingAccount
        });

        await instance.activateStake({
          from: stakingAccount
        });

        await instance.activateStake({
          from: anotherStakingAccount
        });
      });

      it("set totalMintedSupply as the total stake from users", async () => {
        const totalMintedSupply = await instance.totalMintedSupply();

        assert.equal(
          totalMintedSupply.toNumber(),
          initialRequiredStakeAmount * 2
        );
      });

      it("set balance of the user as their stake amount", async () => {
        const balanceOf = await instance.balanceOf(stakingAccount);

        assert.equal(balanceOf, initialRequiredStakeAmount);
      });
    });

    it("should error for non-pending user", async () => {
      const requestWithNonPendingUser = instance.activateStake.call({
        from: accounts[0]
      });

      await truffleAssert.reverts(
        requestWithNonPendingUser,
        "Must intially be a pending staker to activate..."
      );
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

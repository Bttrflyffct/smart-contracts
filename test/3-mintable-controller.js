var MintableController = artifacts.require("./MintableController.sol");
var EthUtil = require("ethereumjs-util");

contract('MintableController', accounts => {

  if (web3.version.network <= 100) return;

  const system = accounts[9];
  let controller;

  beforeEach("setup mintable controller", async () => { 
    controller = await MintableController.deployed();
    await controller.addSystemAccount(system);
  });

  const key = Buffer.from("23f2ee33c522046e80b67e96ceb84a05b60b9434b0ee2e3ae4b1311b9f5dcc46", "hex");
  const address = `0x${EthUtil.privateToAddress(key).toString("hex")}`;

  it("should start with zero tokens", async () => {
    const supply = await controller.totalSupply();
    assert.equal(supply.valueOf(), 0, "initial supply is not 0");  
  });

  it("should fail to mint 666 new tokens from non-system account", async () => {
    try {
      await controller.mint(666, {from: accounts[0]});
    } catch { 
      return;
    }
    assert.fail("succeeded", "fail", "minting should fail from non-system account");
  });

  it("should fail to burn 777 new tokens from non-system account", async () => {
    await controller.addSystemAccount(accounts[8]); 
    await controller.mint(777, {from: accounts[8]});
    await controller.removeSystemAccount(accounts[8]);
    try {
      await controller.burn(777, {from: accounts[8]});
    } catch { 
      return;
    }
    assert.fail("succeeded", "fail", "burn should fail from non-system account");
  });

  it("should fail to burnFrom 888 new tokens from non-system account", async () => {
    await controller.addSystemAccount(accounts[8]); 
    await controller.mintTo(accounts[7], 888, {from: accounts[8]});
    await controller.removeSystemAccount(accounts[8]);
    try {
      await controller.burnFrom(accounts[7], 888, {from: accounts[8]});
    } catch { 
      return;
    }
    assert.fail("succeeded", "fail", "burnFrom should fail from non-system account");
  });

  it("should mint 48000 new tokens", async () => {
    await controller.mint(48000, {from: system});
    const balance = await controller.balanceOf(system);
    assert.equal(balance.valueOf(), 48000, "did not mint 48000 tokens");
  });

  it("should burn 1700 tokens", async () => {
    await controller.burn(1700, {from: system});
    const balance = await controller.balanceOf(system);
    assert.equal(balance.valueOf(), 46300, "remaining tokens should be 46300");
  });

  it("should mint 82300 tokens to a non-system address", async () => {
    await controller.mintTo(address, 82300, {from: system});
    const balance = await controller.balanceOf(address);
    assert.strictEqual(balance.toNumber(), 82300, "did not mint 82300 tokens");
  });

  it("should burn 82000 tokens from a non-system address", async () => {
    const balance0 = await controller.balanceOf(address);
    await controller.burnFrom(address, 82000, {from: system});
    const balance1 = await controller.balanceOf(address);
    assert.strictEqual(balance1.toNumber()-balance0.toNumber(), -82000, "did not burn 82000 tokens");
  });

  it("should fail adding system account from a non-owner address", async () => {
    try {
      await controller.addSystemAccount(accounts[6], {from: accounts[5]});
    } catch { 
      return;
    }
    assert.fail("succeeded", "fail", "adding system account should fail from non-owner account");
  });

  it("should fail removing system account from a non-owner address", async () => {
    await controller.addSystemAccount(accounts[6], {from: accounts[0]});
    const success = await controller.isSystemAccount(accounts[6]);
    assert.strictEqual(success, true, "unable to add system account");
    try {
      await controller.removeSystemAccount(accounts[6], {from: accounts[5]});
    } catch { 
      return;
    }
    assert.fail("succeeded", "fail", "system system account should fail from non-owner account");
  });

});

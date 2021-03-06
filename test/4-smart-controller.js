var SmartController = artifacts.require("./SmartController.sol");
var BlacklistValidator = artifacts.require("./BlacklistValidator.sol");

const hash = `0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2`;
const wallets = {
  "trust wallet": {
    address: `0xB0A6Ed7Fa5C6C5cc507840924591C1494eF47D04`, 
    signature: `0xb5354ef622856f2acd9926752828d609b74471fa349891c70ec4512da5b7b8695418c39d82057dc09c480e8e65c5362327e882033e670e24b6a701983d93e18e1c`,
  },
  "ledger s nano": {
    address: `0x4A6bBDa876699420965147c26C3F3DF0bDc8eCab`,
    signature: `0xbad1a0d53be0e56724d877e053a199ca732c5e6e40d129c5a0980aa7d2c6582166af81969b23004ae81694e9518dcf39eb3af71d2847409376151f03465a0bf600`,
  },
  "meta mask": {
    address: `0xFB7ce0578B4dc16803A3CB04fA0b286fCFfFF76d`,
    signature: `0x1e1769b8ca9ca3d7d4b747f15336c185aac391c89cd9b9bfaf26f0a38631690e64ccd925382278c055c527a58ffab853a9734d889a6bae2b920544645f8ce4361c`,
  },
  "trezor": {
    address: `0xbc89Bea7B6156be4514f5D429e30240F4C2600e4`,
    signature: `0x884d210ebc1437a56e4507c47a5fadcf1076ef366d37d23937a515e8af63075605fbb6be98a9c9dd41bfc68b57795c79375ef10e34a8bf90701a2200ff5cc59d1b`,
  },
};

contract('SmartController', (accounts) => {

  const system = accounts[9];
  let controller;

  beforeEach("setup smart controller", async () => { 
    controller = await SmartController.deployed();
    await controller.addSystemAccount(system);
  });

  it("should start with zero tokens", async () => {
    const supply = await controller.totalSupply();
    assert.equal(supply.valueOf(), 0, "initial supply is not 0");  
  });

  it("should mint 88000 new tokens", async () => {
    await controller.mint(88000, {from: system});
    const balance = await controller.balanceOf(system)
    assert.equal(balance.valueOf(), 88000, "did not mint 88000 tokens");
  });

  it("should transfer 3400 tokens to second account", async () => {
    await controller.transfer(accounts[1], 3400, {from: system});
    const balance = await controller.balanceOf(accounts[1])
    assert.equal(balance.valueOf(), 3400, "did not transfer 3400 tokens"); 
  });

  it("should should fail transferring 1840 tokens from a blacklisted account", async () => {
    const validator = await controller.getValidator();
    (await BlacklistValidator.deployed()).ban(accounts[2]);
    try {
      await controller.transfer(accounts[3], 1840, {from: accounts[2]});
    } catch { 
      return;
    }
    assert.fail("succeeded", "fail", "transfer was supposed to fail");
  });

  var i = 5;
  for(var name in wallets) {
    const account = accounts[i++];
    const wallet = wallets[name];
    it(`should be able to recover the balance of a known address to a new address [${name}]`, async () => {
      await controller.transfer(wallet.address, 13, {from: system});
      const sig = wallet.signature.replace(/^0x/, '');
      const r = `0x${sig.slice(0, 64)}`;
      const s = `0x${sig.slice(64, 128)}`;
      var v = web3.toDecimal(`0x${sig.slice(128, 130)}`);

      if (v < 27) v += 27;
      assert(v == 27 || v == 28);

      try {
        await controller.recover(wallet.address, account, hash, v, r, s, {from: system});
        const balanceFrom = await controller.balanceOf(wallet.address);
        assert.equal(balanceFrom.valueOf(), 0, "did not recover 13 tokens");
        const balanceTo = await controller.balanceOf(account);
        assert.equal(balanceTo.valueOf(), 13, "did not recover 13 tokens");
      } catch {
        assert.fail(`unable to recover ${name}`);
      }
    })
  }

});

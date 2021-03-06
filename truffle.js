result = require('dotenv').config();
if (result.error) console.log(result.error.toString())
const Web3 = require('web3');
const web3 = new Web3();
const WalletProvider = require('truffle-hdwallet-provider');
const bip39 = require('bip39');
const Wallet = require('ethereumjs-wallet');
const HDKey = require('ethereumjs-wallet/hdkey');

const key = process.env['KEY'];
const api = process.env['API'];
const url = process.env['URL'];
const mnemonic = process.env['MNEMONIC'];

var address;
var walletProvider;

function die(s) {
	console.error(s);
	process.exit();
}

if (key != undefined) {
	if (api == undefined) die('API not set')
	if (url == undefined) die('URL not set')
  address = `0xb912740f1389fa0c99965fcda9039b9e5638e5f7`;
  const wallet = Wallet.fromPrivateKey(Buffer.from(key, 'hex'));
  const walletAddress = wallet.getAddressString();
  if (walletAddress != address) die(`Key address ${walletAddress} does not match ${address}`);
  walletProvider = () => new WalletProvider(key, `${url}/v3/${api}`, 0);
} else if (mnemonic != undefined) {
	if (api == undefined) die('API not set')
	if (url == undefined) die('URL not set')
  address = `0x808b6dB94ce973Bab908450E764Db7405A533FAa`;

	if (!bip39.validateMnemonic(mnemonic)) die(`${mnemonic} not valid`);
	const seed = bip39.mnemonicToSeed(mnemonic);
	var wallet = HDKey.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0/0").getWallet();
  const walletAddress = wallet.getAddress().toString('hex');
  if (`0x${walletAddress}` != address.toLowerCase()) die(`HDKey address 0x${walletAddress} does not match ${address}`);
  walletProvider = () => new WalletProvider(mnemonic, `${url}/v3/${api}`, 0);
}

// if this is a function return a wallet provider truffle will reinstantiate
// the wallet provider possibly losing (and reusing) nonces, resulting in
// replacement transaction underpriced errors.
// const walletProvider = () => mnemonic ? new WalletProvider(mnemonic, `${url}/v3/${api}`) : null;

module.exports = {
	networks: {
		development: {
			host: "localhost",
			port: 9545,
			network_id: "*" // Match any network id
		},
		poa: {
			host: "localhost",
			port: 8545,
			network_id: 100
		},
		monerium: {
			host: "e.monerium.com", 
			port: 8549,
			network_id: 2000,   // monerium testnet
			from: "0x253c61c9e3d1aa594761f7ef3f7cbe7a5151f9fd"
    },
		rinkeby: {
			network_id: 4,      // rinkeby
      from: address,
			gas: 6800000,       // balance between out of gas errors and block gas limit errors
			gasPrice: web3.utils.toWei('41', 'gwei'), // average gas price on rinkeby
			provider: () => walletProvider(),
			// optional config values:
			// gas
			// gasPrice
			// from - default address to use for any transaction Truffle makes during migrations
			// provider - web3 provider instance Truffle should use to talk to the Ethereum network.
			//          - if specified, host and port are ignored.
		},
  },
}

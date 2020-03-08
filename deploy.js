const fs = require("fs");
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");

const private_key = process.env.ETH_SECRET;

const provider = new HDWalletProvider(private_key, process.env.ETHCLIENT_URL);

const web3 = new Web3(provider);
const bytecode = fs.readFileSync("./build/Oracle.bin");
const abi = JSON.parse(fs.readFileSync("./build/Oracle.abi"));

(async function() {
  const accounts = await web3.eth.getAccounts();
  const myWalletAddress = accounts[0];

  const myContract = new web3.eth.Contract(abi);

  const deployment = await myContract
    .deploy({
      data: bytecode
    })
    .send({
      from: myWalletAddress,
      gas: 5000000
    });

  console.log(deployment.options.address);
})();

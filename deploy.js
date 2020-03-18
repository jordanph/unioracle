const fs = require("fs");
const util = require("util");
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");

const private_key = process.env.ETH_SECRET;

const provider = new HDWalletProvider(private_key, process.env.ETHCLIENT_URL);

const web3 = new Web3(provider);
const bytecode = fs.readFileSync("./build/Oracle.bin");
const abi = JSON.parse(fs.readFileSync("./build/Oracle.abi"));

const deploy = (async function() {
  const accounts = await web3.eth.getAccounts();
  const myWalletAddress = accounts[0];

  console.log(`Deploying contract with account: ${myWalletAddress}`);

  const myContract = new web3.eth.Contract(abi);

  const deployment = await myContract
    .deploy({
      data: "0x" + bytecode,
      arguments: [1000, 1000]
    })
    .send({
      from: myWalletAddress,
      gas: 8000000
    });

  return deployment.options.address;
})();

deploy
  .then(address => {
    console.log(
      `Contract was successfully deployed! Contract address is: ${address}`
    );

    fs.writeFileSync(__dirname + "/deployed_address.txt", address, "UTF8");

    process.exit(0);
  })
  .catch(error => {
    console.log("Failed to deploy", error);
  });

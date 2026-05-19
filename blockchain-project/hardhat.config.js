require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: ["0x471f1f80f41547a765e2c2645ec2ce995fe87b1dae62b40a4b84c747bc1dff30"]
    }
  }
};
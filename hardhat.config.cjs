require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/c6f59446960f4099ad83093091f3976a`,
      accounts: [
        "a86b23d7bf56f87a4293f1a9d74c0231ae62a589fb5ccde683d46d63186b7717",
      ],
    },
  },
};

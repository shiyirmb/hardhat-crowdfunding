require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // defaultNetwork: "hardhat", // 默认网络，可以不写
  solidity: "0.8.28",
  networks: {
    sepolia: {
      // 可以从第三方拿到免费的JSON-RPC URL Alchemy/Infura/QuickNode
      url: 'https://eth-sepolia.g.alchemy.com/v2/UGo-zdgfEKl3oq6rN6HhtxwVUW4UKpgr', // https://dashboard.alchemy.com/apps
      // 私钥地址，是一个数组。MetaMask或者其他钱包的账户中获取
      accounts: ["6d8f5e03675b0313c9abf10881397e901cd48c3eff7199e593414854f7d1638d"],
    }
  }
};

require("@nomicfoundation/hardhat-toolbox");
// dotenv 用来获取.env中的配置信息 process.env.xxx
// 出于安全考虑，将使用@chainlink/env-enc（可加密）替代dotenv
require('@chainlink/env-enc').config();
// 引入tasks
require('./tasks')
// 引入hardhat-deploy
require('hardhat-deploy');

// 解决网络连接失败参考：https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/2247#discussioncomment-5496669
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

const { SEPOLIA_URL, PRIVATE_KEY, PRIVATE_KEY_2, ETHERSCAN_API_KEY } = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // defaultNetwork: "hardhat", // 默认网络，可以不写
  solidity: "0.8.28",
  // 设置超时时间
  mocha: {
    timeout: 300 * 1000,
  },
  networks: {
    sepolia: {
      // 可以从第三方拿到免费的JSON-RPC URL Alchemy/Infura/QuickNode
      url: SEPOLIA_URL,
      // 私钥地址，是一个数组。MetaMask或者其他钱包的账户中获取
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
      // sepolia 区块链ID
      chainId: 11155111,
    }
  },
  etherscan: {
    // 参考：https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#usage
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    }
  },
  namedAccounts: {
    account1: {
      default: 0,
    },
    account2: {
      default: 1,
    }
  }
};

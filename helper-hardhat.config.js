const DECIMALS = 8 // 小数点位数
const INITIAL_ANSWER = 3000 * 10 ** 8 // 价格数据\
const LOCK_TIME = 1 // 锁定时间：天
const CONFIRMATIONS = 5 // 区块确认个数

const devlopmentChains = ['local', 'hardhat'] // 本地开发网络名称
const networkConfig = {
    // 环境对应喂价地址查看： https://docs.chain.link/data-feeds/using-data-feeds
    // 环境对应chainId查看： https://chainlist.org/
    11155111: {
        ethUsdDataFeedAddr: '0x694AA1769357215DE4FAC081bf1f309aDC325306', // 以太坊-Sepolia测试网-ETH/USD喂价地址
    },
    97: {
        ethUsdDataFeedAddr: '0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7', // BNB-smart chain测试网-ETH/USD喂价地址
    }
}

// 合约验证参考 https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#using-programmatically
async function verifyCrowFunding(contractAddress, args) {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
    });
}

module.exports = {
    DECIMALS,
    INITIAL_ANSWER,
    LOCK_TIME,
    CONFIRMATIONS,
    devlopmentChains,
    networkConfig,
    verifyCrowFunding,
}
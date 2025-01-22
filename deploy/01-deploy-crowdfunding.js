// hardhat 提供4个运行时环境变量[hre]，参考：https://www.npmjs.com/package/hardhat-deploy

const { network } = require("hardhat")
const { 
    devlopmentChains, 
    networkConfig, 
    LOCK_TIME, 
    verifyCrowFunding, 
    CONFIRMATIONS,
} = require('../helper-hardhat.config')

// getNamedAccounts、getUnnamedAccounts、deployments、getChainId
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { account1 } = await getNamedAccounts()
    const { deploy } = deployments

    // 喂价，如果是本地环境采用mock地址，否则使用相应环境中的地址
    let datafeedAddr, waitConfirmations
    if (devlopmentChains.includes(network.name)) {
        const MockV3Aggregator = await deployments.get("MockV3Aggregator")
        datafeedAddr = MockV3Aggregator.address
        waitConfirmations = 0
    } else {
        datafeedAddr = networkConfig[network.config.chainId].ethUsdDataFeedAddr
        waitConfirmations = CONFIRMATIONS
    }

    const CrowdFunding = await deploy("CrowdFunding", {
        from: account1,
        args: [LOCK_TIME, datafeedAddr],
        log: true,
        waitConfirmations, // 等待确认
    })

    // 合约验证
    if ([11155111].includes(network.config.chainId) && process.env.ETHERSCAN_API_KEY) {
        await verifyCrowFunding(CrowdFunding.address, [LOCK_TIME, datafeedAddr])
    } else {
        console.log('非 sepolia 环境，已跳过验证')
    }
}

module.exports.tags = ["all", "crowdfunding"]
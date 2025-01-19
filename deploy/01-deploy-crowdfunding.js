// hardhat 提供4个运行时环境变量[hre]，参考：https://www.npmjs.com/package/hardhat-deploy

const { network } = require("hardhat")
const { devlopmentChains, networkConfig, LOCK_TIME } = require('../helper-hardhat.config')

// getNamedAccounts、getUnnamedAccounts、deployments、getChainId
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { account1 } = await getNamedAccounts()
    const { deploy } = deployments
    // 喂价，如果是本地环境采用mock地址，否则使用相应环境中的地址
    let datafeedAddr = ''
    if (devlopmentChains.includes(network.name)) {
        const MockV3Aggregator = await deployments.get("MockV3Aggregator")
        datafeedAddr = MockV3Aggregator.address
    } else {
        datafeedAddr = networkConfig[network.config.chainId].ethUsdDataFeedAddr
    }
    await deploy("CrowdFunding", {
        from: account1,
        args: [LOCK_TIME, datafeedAddr],
        log: true,
    })
}

module.exports.tags = ["all", "crowdfunding"]
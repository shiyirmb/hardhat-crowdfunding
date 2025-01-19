const { DECIMALS, INITIAL_ANSWER, devlopmentChains } = require('../helper-hardhat.config.js')

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (devlopmentChains.includes(network.name)) {
        const { account1 } = await getNamedAccounts()
        const { deploy } = deployments
        await deploy("MockV3Aggregator", {
            from: account1,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
    } else {
        console.log('非本地环境，不需要部署mock合约')
    }
}

module.exports.tags = ["all", "mock"]
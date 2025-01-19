const { DECIMALS, INITIAL_ANSWER } = require('../helper-hardhat.config.js')

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { account1 } = await getNamedAccounts()
    const { deploy } = deployments
    await deploy("MockV3Aggregator", {
        from: account1,
        args: [DECIMALS, INITIAL_ANSWER],
        log: true,
    })
}

module.exports.tags = ["all", "mock"]
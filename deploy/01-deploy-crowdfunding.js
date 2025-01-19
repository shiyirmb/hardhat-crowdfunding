// hardhat 提供4个运行时环境变量[hre]，参考：https://www.npmjs.com/package/hardhat-deploy
// getNamedAccounts、getUnnamedAccounts、deployments、getChainId
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { account1 } = await getNamedAccounts()
    console.log('account1', account1)
    const { deploy } = deployments
    await deploy("CrowdFunding", {
        from: account1,
        args: [1],
        log: true,
    })
}

module.exports.tags = ["all", "crowdfunding"]
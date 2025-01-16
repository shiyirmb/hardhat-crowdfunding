const { task } = require('hardhat/config')

task("deploy-crowdfunding", "部署crowdfunding合约并验证").setAction(async (taskArgs, hre) => {
    // 创建合约工厂 负责部署合约
    const crowdFundingFactory = await ethers.getContractFactory("CrowdFunding")
    // 进行合约的部署
    console.log('合约部署中...')
    // 发送交易 不保证能否成功上链
    const crowdFunding = await crowdFundingFactory.deploy(1)
    // 等待合约上链（入块）
    await crowdFunding.waitForDeployment()
    console.log(`合约部署完成，合约地址：${crowdFunding.target}`)
    if ([11155111].includes(hre.network.config.chainId) && process.env.ETHERSCAN_API_KEY) {
        // 等待五次确认
        console.log(`等待五次确认中...`)
        await crowdFunding.deploymentTransaction().wait(5)
        // 验证合约
        console.log(`已确认，合约验证中...`)
        await verifyCrowFunding(crowdFunding.target, [1])
        console.log(`合约验证完成`)
    } else {
        console.log('已跳过合约验证')
    }
})

// 合约验证参考 https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#using-programmatically
async function verifyCrowFunding(contractAddress, args) {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
    });
}

module.exports = {}
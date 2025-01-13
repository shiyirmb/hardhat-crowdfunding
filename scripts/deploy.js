// 使用 ethers 对合约进行 部署 和 交互
const { ethers } = require("hardhat")

async function main() {
    // 创建合约工厂 负责部署合约
    const crowdFundingFactory = await ethers.getContractFactory("CrowdFunding")
    // 进行合约的部署
    console.log('合约部署中...')
    // 发送交易 不保证能否成功上链
    const crowdFunding = await crowdFundingFactory.deploy(100, 1, 1000)
    // 等待合约上链（入块）
    await crowdFunding.waitForDeployment()
    console.log(`合约部署完成，合约地址：${crowdFunding.target}`)
}

// 执行函数并对错误进行处理
main().then().catch((error) => {
    console.error(error)
    process.exit(1) // 正常退出-0 异常退出-1
})
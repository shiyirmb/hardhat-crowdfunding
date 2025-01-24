const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { expect } = require("chai")
const { LOCK_TIME, devlopmentChains } = require("../../helper-hardhat.config")

// 合约部署到主网前，需要进行集成测试，弥补单元测试覆盖不到的两个点
// 1、合约使用第三方服务的时候，如：喂价，只能返回一个固定的价格
// 2、出块的延迟无法模拟

// 开发环境跳过集成测试
const devTest = () => {
    describe.skip
}
// 生产环境执行集成测试
const prodTest = () => {
    describe('测试 CrowdFunding 合约', async () => {
        let account1, crowdFunding;
        // 在进行每个测试之前都会运行 beforeEach
        beforeEach(async() => {
            // 部署所有tag为all的合约脚本
            await deployments.fixture(["all"])
            account1 = (await getNamedAccounts()).account1
            const crowdFundingDeployMent = await deployments.get("CrowdFunding")
            crowdFunding = await ethers.getContractAt("CrowdFunding", crowdFundingDeployMent.address)
        })
    
        it("测试 payment 并且 getFund 成功", async () => {
            await crowdFunding.payment({ value: ethers.parseEther("0.5") })
            // 配置文件中配置的LOCK_TIME单位是天，setTimeout中数字表示的时间单位是毫秒
            const delayTime = (LOCK_TIME + 1) * 1000
            await new Promise(resolve => setTimeout(resolve, delayTime))
            const tx = await crowdFunding.getFund()
            // 确保能收到 receipt 回执
            const receipt = await tx.wait()
            await expect(receipt).to.emit(crowdFunding, "FundWithdrawByOwner").withArgs(ethers.parseEther("0.5"))
        })
        it("测试 payment 并且 refund 成功", async () => {
            await crowdFunding.payment({ value: ethers.parseEther("0.1") })
            // 配置文件中配置的LOCK_TIME单位是秒，setTimeout中数字表示的时间单位是毫秒
            const delayTime = (LOCK_TIME + 1) * 1000
            await new Promise(resolve => setTimeout(resolve, delayTime))
            const tx = await crowdFunding.refund()
            // 确保能收到 receipt 回执
            const receipt = await tx.wait()
            await expect(receipt).to.emit(crowdFunding, "RefundByInvestor").withArgs(account1, ethers.parseEther("0.1"))
        })
    })
}

devlopmentChains.includes(network.name) ? devTest() : prodTest()

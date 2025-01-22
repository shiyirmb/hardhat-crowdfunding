const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

// 写单元测试的目的：
// 1、可以在本地运行，测试效率特别高
// 2、对一些关键函数进行模拟操作，看合法操作是否可以得到预期结果，非法操作是否可以被阻断
// 3、谁都有可能会修改升级合约，修改后运行单元测试可检测合约是否仍然安全

describe('测试 CrowdFunding 合约', async () => {
    let account1, account2, crowdFunding, mockDataFeed;
    // 在进行每个测试之前都会运行 beforeEach
    beforeEach(async() => {
        // 部署所有tag为all的合约脚本
        await deployments.fixture(["all"])
        account1 = (await getNamedAccounts()).account1
        account2 = (await getNamedAccounts()).account2
        const crowdFundingDeployMent = await deployments.get("CrowdFunding")
        const MockV3Aggregator = await deployments.get("MockV3Aggregator")
        mockDataFeed = MockV3Aggregator.address
        crowdFunding = await ethers.getContractAt("CrowdFunding", crowdFundingDeployMent.address)
    })

    it('测试 owner 与 msg.sender 相等', async () => {
        await crowdFunding.waitForDeployment()
        assert.equal(await crowdFunding.owner(), account1)
    });
    
    it('测试 dataFeed 为 mock合约的地址', async () => {
        await crowdFunding.waitForDeployment()
        assert.equal(await crowdFunding.dataFeed(), mockDataFeed)
    });

    it("测试 payment: 已过锁定期 交易金额大于最小投资金额 交易失败", async () => {
        // 模拟时间流逝 1天 确保已过锁定期
        await helpers.time.increase(1 * 24 * 60 * 60)
        // 模拟挖矿
        await helpers.mine()
        // 确保 交易金额大于最小投资金额
        const tx = crowdFunding.payment({ value: ethers.parseEther("0.01") })
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("This is over the lock time")
    })
    it("测试 payment: 未过锁定期 交易金额小于最小投资金额 交易失败", async () => {
        // 确保 交易金额小于最小投资金额
        const tx = crowdFunding.payment({ value: ethers.parseEther("0.001") })
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("Send more ETH")
    })
    it("测试 payment: 未过锁定期 交易金额大于最小投资金额 交易成功 投资人的投资金额被正确记录", async () => {
        // 确保 交易金额大于最小投资金额
        await crowdFunding.payment({ value: ethers.parseEther("0.01") })
        // 拿到投资人的投资金额
        const balance = await crowdFunding.investorToAmount(account1)
        // assert.equal(balance, ethers.parseEther("0.01"))
        expect(balance).to.equal(ethers.parseEther("0.01"))
    })

    it("测试 getFund: 未过锁定期 已达众筹预期金额 操作人为合约拥有者 交易失败", async () => {
        // 确保 已达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("1") })
        // 确保 操作人为合约拥有者
        const tx = crowdFunding.connect(account1).getFund()
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("This is not over the lock time")
    })
    it("测试 getFund: 已过锁定期 未达众筹预期金额 操作人为合约拥有者 交易失败", async () => {
        // 确保 未达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("0.1") })
        // 模拟时间流逝 1天 确保已过锁定期
        await helpers.time.increase(1 * 24 * 60 * 60)
        // 模拟挖矿
        await helpers.mine()
        // 确保 操作人为合约拥有者
        const tx = crowdFunding.connect(account1).getFund()
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("Target amount is not reached")
    })
    it("测试 getFund: 已过锁定期 已达众筹预期金额 操作人不是合约拥有者 交易失败", async () => {
        // 确保 已达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("1") })
        // 模拟时间流逝 1天 确保已过锁定期
        await helpers.time.increase(1 * 24 * 60 * 60)
        // 模拟挖矿
        await helpers.mine()
        // 确保 操作人不是合约拥有者
        const tx = crowdFunding.connect(account2).getFund()
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("You are not the owner")
    })
    it("测试 getFund: 已过锁定期 已达众筹预期金额 操作人为合约拥有者 交易成功 FundWithdrawByOwner事件被记录", async () => {
        // 确保 已达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("1") })
        // 模拟时间流逝 1天 确保已过锁定期
        await helpers.time.increase(1 * 24 * 60 * 60)
        // 模拟挖矿
        await helpers.mine()
        // 确保 操作人为合约拥有者
        const tx = crowdFunding.connect(account1).getFund()
        // FundWithdrawByOwner 事件被记录 则表示已成功调用getFund
        expect(tx).to.emit(crowdFunding, "FundWithdrawByOwner").withArgs(ethers.parseEther("1"))
    })

    
    it("测试 refund: 未过锁定期 未达众筹预期金额 投资人有投资金额 交易失败", async () => {
        // 确保 投资人有投资金额 未达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("0.1") })
        const tx = crowdFunding.refund()
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("This is not over the lock time")
    })
    it("测试 refund: 已过锁定期 已达众筹预期金额 投资人有投资金额 交易失败", async () => {
        // 确保 已达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("1") })
        // 模拟时间流逝 1天 确保已过锁定期
        await helpers.time.increase(1 * 24 * 60 * 60)
        // 模拟挖矿
        await helpers.mine()
        // 确保 投资人有投资金额
        const tx = crowdFunding.refund()
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("Target amount is reached")
    })
    it("测试 refund: 已过锁定期 未达众筹预期金额 投资人没有投资金额 交易失败", async () => {
        // 确保 未达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("0.1") })
        // 模拟时间流逝 1天 确保已过锁定期
        await helpers.time.increase(1 * 24 * 60 * 60)
        // 模拟挖矿
        await helpers.mine()
        // 确保 投资人没有投资金额 投资的是account1 退款的是account2
        const tx = crowdFunding.connect(account2).refund()
        // 预期 此交易会失败
        expect(tx).to.be.revertedWith("There is no fund for you")
    })
    it("测试 refund: 已过锁定期 未达众筹预期金额 投资人有投资金额 交易成功", async () => {
        // 确保 未达众筹预期金额
        await crowdFunding.payment({ value: ethers.parseEther("0.1") })
        // 模拟时间流逝 1天 确保已过锁定期
        await helpers.time.increase(1 * 24 * 60 * 60)
        // 模拟挖矿
        await helpers.mine()
        // 确保 投资人有投资金额
        const tx = crowdFunding.refund()
        // FundWithdrawByOwner 事件被记录 则表示已成功调用getFund
        expect(tx).to.emit(crowdFunding, "RefundByInvestor").withArgs(account1, ethers.parseEther("0.1"))
    })
});
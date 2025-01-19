const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert } = require("chai")

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

    it('测试 owner 是否和 msg.sender 相等', async () => {
        await crowdFunding.waitForDeployment()
        assert.equal(await crowdFunding.owner(), account1)
    });
    
    it('测试 dataFeed 是否为 0x694AA1769357215DE4FAC081bf1f309aDC325306', async () => {
        await crowdFunding.waitForDeployment()
        assert.equal(await crowdFunding.dataFeed(), "0x694AA1769357215DE4FAC081bf1f309aDC325306")
    });
});
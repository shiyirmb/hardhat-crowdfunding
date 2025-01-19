const { ethers } = require("hardhat");
const { assert } = require("chai")

describe('测试 CrowdFunding 合约', async () => {
    it('测试 owner 是否和 msg.sender 相等', async () => {
        const [accounts1] = await ethers.getSigners()
        const crowdFundingFactory = await ethers.getContractFactory("CrowdFunding")
        const crowdFunding = await crowdFundingFactory.deploy(1)
        await crowdFunding.waitForDeployment()
        assert.equal(await crowdFunding.owner(), accounts1.address)
    });
    
    it('测试 dataFeed 是否为 0x694AA1769357215DE4FAC081bf1f309aDC325306', async () => {
        const crowdFundingFactory = await ethers.getContractFactory("CrowdFunding")
        const crowdFunding = await crowdFundingFactory.deploy(1)
        await crowdFunding.waitForDeployment()
        assert.equal(await crowdFunding.dataFeed(), "0x694AA1769357215DE4FAC081bf1f309aDC325306")
    });
});
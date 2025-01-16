const { task } = require('hardhat/config')

task("interact-crowdfunding", "与crowdfunding合约交互")
    // npx hardhat interact-crowdfunding --addr 你的合约地址 --network sepolia 
    .addParam("addr", "已部署crowdfunding合约的地址")
    .setAction(async (taskArgs, hre) => {
        // 创建合约工厂
        const crowdFundingFactory = await ethers.getContractFactory("CrowdFunding")
        // 创建合约
        const crowdFunding = await crowdFundingFactory.attach(taskArgs.addr)
        
        console.log('初始化合约账号中...');
        const [account1, account2] = await ethers.getSigners()
        // 使用第一个账号进行交易
        const tx1 = await crowdFunding.payment({ value: ethers.parseEther("0.1") })
        console.log(`第一个账号等待交易入块中...`);
        await tx1.wait()
        // ethers.provider 作用等同于 MetaMask etherscan
        const balanceOfContractAfterAccount1 = await ethers.provider.getBalance(crowdFunding.target)
        console.log(`查看合约上的ETH: ${balanceOfContractAfterAccount1}`);

        // 使用第二个账号进行交易
        const tx2 = await crowdFunding.connect(account2).payment({ value: ethers.parseEther("0.2") })
        console.log(`第二个账号等待交易入块中...`);
        await tx2.wait()
        const balanceOfContractAfterAccount2 = await ethers.provider.getBalance(crowdFunding.target)
        console.log(`查看合约上的ETH: ${balanceOfContractAfterAccount2}`);

        // 分别查看两个账号上面的ETH
        const balanceOfAccount1 = await crowdFunding.investorToAmount(account1.address)
        console.log(`第一个账号[${account1.address}]上的ETH: ${balanceOfAccount1}`);
        const balanceOfAccount2 = await crowdFunding.investorToAmount(account2.address)
        console.log(`第二个账号[${account2.address}]上的ETH: ${balanceOfAccount2}`);
    })

module.exports = {}
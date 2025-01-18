const { task } = require('hardhat/config')

task("interact-cft", "与CrowdFundingToken合约交互")
    .addParam("addr", "已部署CrowdFundingToken合约的地址")
    .setAction(async (taskArgs, hre) => {
        console.log('合约账号创建中...');
        // 创建合约工厂
        const CFTFactory = await ethers.getContractFactory("CrowdFundingToken")
        // 创建合约
        const CFT = await CFTFactory.attach(taskArgs.addr)

        console.log('初始化合约账号中...');
        const [account1, account2] = await ethers.getSigners()

        // 给第1个账号铸币
        console.log('第1个账号铸币中...');
        const mint1 = await CFT.mint(20000000000)
        await mint1.wait()
        let num1 = await CFT.balanceOf(account1.address)
        console.log(`第1个账号代币数量：${num1}`);

        // 给第2个账号铸币
        console.log('第2个账号铸币中...');
        const mint2 = await CFT.connect(account2).mint(30000000000)
        await mint2.wait()
        let num2 = await CFT.balanceOf(account2.address)
        console.log(`第2个账号代币数量：${num2}`);

        // 第1个账号领取并使用币
        console.log('第1个账号代币领取并使用中...');
        const claim1 = await CFT.claim(11000000)
        await claim1.wait()
        num1 = await CFT.balanceOf(account1.address)
        console.log(`第1个账号代币数量：${num1}`);

        // 第2个账号领取并使用币
        console.log('第2个账号代币领取并使用中...');
        const claim2 = await CFT.connect(account2).claim(22000000)
        await claim2.wait()
        num2 = await CFT.balanceOf(account2.address)
        console.log(`第2个账号代币数量：${num2}`);

        // 第1个账号交易给第2个账号代币
        console.log('第1个账号交易给第2个账号代币中...');
        const tx = await CFT.transfer(account2.address, 1000)
        await tx.wait()
        num1 = await CFT.balanceOf(account1.address)
        console.log(`第1个账号代币数量：${num1}`);
        num2 = await CFT.balanceOf(account2.address)
        console.log(`第2个账号代币数量：${num2}`);
    })

module.exports = {}
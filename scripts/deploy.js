// 使用 ethers 对合约进行 部署 和 交互
const { ethers } = require("hardhat")

async function main() {
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

        // 初始化合约账号
        const [account1, account2] = await ethers.getSigners()
        // 使用第一个账号进行交易
        const tx1 = await crowdFunding.payment({ value: ethers.parseEther("0.5") })
        console.log(`第一个账号等待交易入块中...`);
        await tx1.wait()
        // ethers.provider 作用等同于 MetaMask etherscan
        const balanceOfContractAfterAccount1 = await ethers.provider.getBalance(crowdFunding.target)
        console.log(`查看合约上的ETH: ${balanceOfContractAfterAccount1}`);

        // 使用第二个账号进行交易
        const tx2 = await crowdFunding.connect(account2).payment({ value: ethers.parseEther("0.5") })
        console.log(`第二个账号等待交易入块中...`);
        await tx2.wait()
        const balanceOfContractAfterAccount2 = await ethers.provider.getBalance(crowdFunding.target)
        console.log(`查看合约上的ETH: ${balanceOfContractAfterAccount2}`);

        // 分别查看两个账号上面的ETH
        const balanceOfAccount1 = await crowdFunding.investorToAmount(account1.address)
        console.log(`第一个账号[${account1.address}]上的ETH: ${balanceOfAccount1}`);
        const balanceOfAccount2 = await crowdFunding.investorToAmount(account2.address)
        console.log(`第二个账号[${account2.address}]上的ETH: ${balanceOfAccount2}`);
    } else {
        console.log('已跳过合约验证')
    }
}

// 合约验证参考 https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#using-programmatically
async function verifyCrowFunding(contractAddress, args) {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
    });
}


// 执行函数并对错误进行处理
main().then().catch((error) => {
    console.error(error)
    process.exit(1) // 正常退出-0 异常退出-1
})

// 执行命令：npx hardhat run scripts/deploy.js --network sepolia
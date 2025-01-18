const { task } = require('hardhat/config')

task("deploy-cft", "部署CrowdFundingToken合约并验证")
    .addParam("addr", "已部署的CrowdFunding地址")
    .setAction(async (taskArgs, hre) => {
        const CFTFactory = await ethers.getContractFactory("CrowdFundingToken")
        console.log('CFT合约部署中...')
        const CFT = await CFTFactory.deploy(taskArgs.addr)
        await CFT.waitForDeployment()
        console.log(`CFT合约部署完成，合约地址：${CFT.target}`)

        if ([11155111].includes(hre.network.config.chainId) && process.env.ETHERSCAN_API_KEY) {
            console.log('等待5个交易确认中...')
            await CFT.deploymentTransaction().wait(5)
            console.log('交易已确认，合约验证中...')
            await verifyCFT(CFT.target, [taskArgs.addr])
            console.log('合约验证完成')
        } else {
            console.log('已跳过合约验证')
        }
    })

async function verifyCFT(contractAddress, args) {
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
    })
}

exports.default = {}
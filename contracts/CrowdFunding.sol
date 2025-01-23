// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Data Feed 使用参考 https://docs.chain.link/data-feeds/using-data-feeds
// 注: 第三方服务不能在本地使用，需要部署到测试或者正式网络上
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1.创建收款函数用于收款
// 2.记录投资人&查看投资人投资金额
// 3.在锁定期内，达到预期金额，合约拥有者可以提取资金
// 4.在锁定期内，未达到预期金额，投资人可以退款

// 创建众筹合约
contract CrowdFunding {
    // 记录投资人&投资金额
    mapping(address => uint256) public investorToAmount;
    // 设置最小投资金额
    uint256 minAmount = 10 * 10 ** 18; // 10USD
    // 声明喂价变量
    AggregatorV3Interface public dataFeed;

    // 合约拥有者
    address public owner;
    // 设定众筹目标金额
    uint256 targetAmount = 1000 * 10 ** 18; // 1000USD

    // 合约部署的时间 距离1970年1月1日的秒数
    uint256 deploymentTime;
    // 锁定期 单位为秒
    uint256 lockTime;

    // 发起人是否成功取款
    bool public getFundSuccess = false;
    // ERC20通证合约地址 用于判断是否可以调用重置 investorToAmount
    address public erc20Addr;

    // 当合约拥有者成功提取众筹资金时，记录操作事件日志 记录提取的金额
    event FundWithdrawByOwner(uint256);
    // 当锁定期已过 并且 众筹未达到目标时，记录投资人退款事件日志
    event RefundByInvestor(address, uint256);

    constructor(uint256 _lockTime, address datafeedAddr) {
        // 初始化喂价变量 0x694AA1769357215DE4FAC081bf1f309aDC325306 // 以太坊-Sepolia测试网-ETH/USD地址
        dataFeed = AggregatorV3Interface(datafeedAddr);
        // 合约部署者就是合约拥有者
        owner = msg.sender;
        // 合约的部署时间就是当前区块的时间戳
        deploymentTime = block.timestamp;
        // 锁定期由部署合约时确定 单位：秒
        lockTime = _lockTime;
    }

    // 创建收款函数
    function payment() external payable {
        // 合约部署时间+锁定期=锁定期结束时间，当前区块时间在结束时间之前可以进行投资
        require(deploymentTime + lockTime >= block.timestamp, "This is over the lock time");
        // 验证投资金额是否满足最小投资金额 否则交易将退回
        require(turnEthToUsd(msg.value) >= minAmount, "Send more ETH");
        // 记录投资人及投资金额 多次投资累加金额
        investorToAmount[msg.sender] += msg.value;
    }

    // 获取 ETH/USD 最新的价格
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function turnEthToUsd(uint256 ethAmount) internal view returns (uint256) {
        // ETH数量 * ETH价格 = 总价格
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8); // ETH/USD 精度为8位
    }

    // 修改合约拥有者 只有合约拥有者才可以修改
    function turnOwner(address newOwnerAddress) external isOwner {
        owner = newOwnerAddress;
    }

    // 合约拥有者 取款 超过锁定期才可以取款
    function getFund() external isOwner isOverLockTime {
        // 当前合约中的ETH数量 address(this).balance
        // 地址变量默认是不可收款的需要payable转换
        // 需要达到目标金额才可以转账
        require(turnEthToUsd(address(this).balance) >= targetAmount, "Target amount is not reached");

        // 三种转账函数-1：transfer addr.transfer(amount) 此方法将ETH从一个地址转移到另一个地址，如果出现错误会回退
        // payable(msg.sender).transfer(address(this).balance);

        // 三种转账函数-2：send 与 transfer一样 但是它是返回一个布尔值 true or false
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed");

        // 三种转账函数-3：call 以太坊官方推荐函数
        // (bool, value) = addr.call{value: value}("data"); => (布尔值, 返回值) = 转账地址.call{value: 转账的ETH}("数据");
        uint256 balance = address(this).balance;
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "tx failed");
        // investorToAmount[msg.sender] = 0;
        getFundSuccess = true;
        // emit event 比较重要的操作 添加日志
        emit FundWithdrawByOwner(balance);
    }

    // 投资者 退款 超过锁定期才可以退款
    function refund() external isOverLockTime {
        // 没有达到目标金额才可退款
        require(turnEthToUsd(address(this).balance) < targetAmount, "Target amount is reached");
        // 参与过投资（有投资金额）才可退款
        require(investorToAmount[msg.sender] != 0, "There is no fund for you");
        bool success;
        // 先记录下投资人投资的金额，后清除投资人金额，最后转账，防止重入攻击
        uint256 amount = investorToAmount[msg.sender];
        investorToAmount[msg.sender] = 0;
        (success, ) = payable(msg.sender).call{value: amount}("");
        if (success) {
            // 退款成功 添加退款日志
            emit RefundByInvestor(msg.sender, amount);
        } else {
            // 退款失败 恢复投资人投资金额
            investorToAmount[msg.sender] = amount;
        }
    }

    // 设置ERC20通证合约地址
    function setAddress(address _erc20Addr) public isOwner {
        erc20Addr = _erc20Addr;
    }

    // 重新设置投资人投资的金额 必须为FundTokenERC20的那个特定合约才可以操作
    function setInvestorToAmount(address addr, uint256 amount) external {
        // 这里是FundTokenERC20合约自动调用的，所以msg.sender是合约部署后生成的合约地址
        require(msg.sender == erc20Addr, "You do not have permission to call this function");
        investorToAmount[addr] = amount;
    }

    // 函数修饰器 是否为合约拥有者
    modifier isOwner {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    // 函数修饰器 是否已过锁定期
    modifier isOverLockTime {
        // 合约部署时间+锁定期=锁定期结束时间，当前区块时间在结束时间之后可以提款或者退款
        require(deploymentTime + lockTime < block.timestamp, "This is not over the lock time");
        _;
    }
}
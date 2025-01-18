
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 引入 ERC20 标准合约 使用参考：https://docs.openzeppelin.com/contracts/5.x/erc20
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// 引入 众筹合约
import { CrowdFunding } from './CrowdFunding.sol';

// 1、基于投资者在众筹时， 自己投资的金额 领取相应数量的通证
// 2、投资者可以交易自己的通证（使用ERC20自带的交易函数）
// 3、通证在使用完成以后，及时 burn 掉

contract CrowdFundingToken is ERC20 {
    // 声明crowdFunding合约实例
    CrowdFunding crowdFunding;
    constructor(address crowdFundingAddr) ERC20("CrowdFundingToken", "CFT") {
        // 使用CrowdFunding合约地址初始化CrowdFunding合约实例
        crowdFunding = CrowdFunding(crowdFundingAddr);
    }

    // 铸造通证
    function mint(uint256 mintAmount) public isCompleted {
        // 如果要铸造的通证数量大于投资的金额数量 则不可铸造
        require(crowdFunding.investorToAmount(msg.sender) >= mintAmount, "You do not mint more tokens");
        // 调用ERC20标准合约的铸造方法
        _mint(msg.sender, mintAmount);
        // 铸造完成后 CrowdFunding合约中 减掉相应的数量
        crowdFunding.setInvestorToAmount(msg.sender, crowdFunding.investorToAmount(msg.sender) - mintAmount);
    }

    // 领取并使用通证
    function claim(uint256 claimAmount) public isCompleted {
        // ERC20 合约中自带查看通证的方法 balanceOf
        require(balanceOf(msg.sender) >= claimAmount, "You do not have enough tokens");
        // 通证使用后 及时烧掉
        _burn(msg.sender, claimAmount);
    }

    // 函数修饰器 发起人是否已提款
    modifier isCompleted {
        // 如果发起人没有取出所有的投资金 也不可铸造
        require(crowdFunding.getFundSuccess(), "The crowd-funding is not completed yet");
        _;
    }
}

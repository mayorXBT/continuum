// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {Pausable} from "openzeppelin-contracts/utils/Pausable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";
import {StMON} from "./StMON.sol";

/// @notice Permissioned liquid staking vault. Exchange-rate accounting;
/// rewards are a simulated testnet drip, clearly labeled in the UI.
contract StakingVault is Ownable, Pausable {
    ICleanverseIdentity public immutable identity;
    StMON public immutable stMON;
    address public redemptionQueue;
    uint256 public totalAssets;

    error NotVerified(address account);
    error CredentialRevoked(address account);
    error NotAuthorized(address caller);
    error ZeroAmount();
    error TransferFailed();
    error AlreadyInitialized();

    event Staked(address indexed account, uint256 assets, uint256 shares);
    event Unstaked(address indexed account, uint256 assets, uint256 shares);

    constructor(ICleanverseIdentity identity_, StMON stMON_) Ownable(msg.sender) {
        identity = identity_;
        stMON = stMON_;
    }

    function setRedemptionQueue(address queue_) external onlyOwner {
        if (redemptionQueue != address(0)) revert AlreadyInitialized();
        redemptionQueue = queue_;
    }

    function stake() external payable whenNotPaused {
        if (msg.value == 0) revert ZeroAmount();
        _requireEligible(msg.sender);
        uint256 supply = stMON.totalSupply();
        uint256 shares = supply == 0 ? msg.value : (msg.value * supply) / totalAssets;
        totalAssets += msg.value;
        stMON.mint(msg.sender, shares);
        emit Staked(msg.sender, msg.value, shares);
    }

    function unstake(uint256 shares) external whenNotPaused {
        if (shares == 0) revert ZeroAmount();
        _requireEligible(msg.sender);
        uint256 assets = (shares * totalAssets) / stMON.totalSupply();
        stMON.burn(msg.sender, shares);
        totalAssets -= assets;
        (bool ok,) = msg.sender.call{value: assets}("");
        if (!ok) revert TransferFailed();
        emit Unstaked(msg.sender, assets, shares);
    }

    event RewardsDripped(uint256 amount, uint256 newExchangeRate);
    event RedemptionSettled(address indexed receiver, uint256 assets, uint256 shares);

    /// @notice Burns queue-locked shares and delivers underlying MON to the
    /// reviewed, eligible receiver. Only the RedemptionQueue may call.
    function settleRedemption(address receiver, uint256 shares) external returns (uint256 assets) {
        if (msg.sender != redemptionQueue) revert NotAuthorized(msg.sender);
        assets = (shares * totalAssets) / stMON.totalSupply();
        stMON.burn(redemptionQueue, shares);
        totalAssets -= assets;
        (bool ok,) = receiver.call{value: assets}("");
        if (!ok) revert TransferFailed();
        emit RedemptionSettled(receiver, assets, shares);
    }

    /// @notice Simulated testnet rewards: deposits raise stMON redemption
    /// value. Labeled "simulated testnet rewards" in all UI copy.
    function dripRewards() external payable onlyOwner {
        totalAssets += msg.value;
        emit RewardsDripped(msg.value, exchangeRate());
    }

    function exchangeRate() public view returns (uint256) {
        uint256 supply = stMON.totalSupply();
        return supply == 0 ? 1e18 : (totalAssets * 1e18) / supply;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _requireEligible(address account) internal view {
        if (!identity.isVerified(account)) revert NotVerified(account);
        if (identity.isFlagged(account)) revert CredentialRevoked(account);
    }
}

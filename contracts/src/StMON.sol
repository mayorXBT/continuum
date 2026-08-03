// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";

/// @notice Cleanverse policy-gated liquid staking receipt.
/// Not a CVA/A-Token; CVA-native issuance is the upgrade path (spec: Claims discipline).
contract StMON is ERC20, Ownable {
    ICleanverseIdentity public immutable identity;
    address public vault;
    address public redemptionQueue;
    bool public initialized;

    error NotVerified(address account);
    error CredentialRevoked(address account);
    error NotAuthorized(address caller);
    error AlreadyInitialized();

    constructor(ICleanverseIdentity identity_)
        ERC20("Continuum MON", "stMON")
        Ownable(msg.sender)
    {
        identity = identity_;
    }

    function initialize(address vault_, address queue_) external onlyOwner {
        if (initialized) revert AlreadyInitialized();
        vault = vault_;
        redemptionQueue = queue_;
        initialized = true;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != vault) revert NotAuthorized(msg.sender);
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != vault) revert NotAuthorized(msg.sender);
        _burn(from, amount);
    }

    /// @dev Compliance gate on every movement. Sole exception to the flagged-
    /// sender block: transfers to/from the RedemptionQueue, the controlled-exit
    /// path ("compliance without confiscation"). The queue only ever locks,
    /// returns to requester, or burns — it never forwards.
    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0)) {
            _requireEligible(to); // mint
        } else if (to != address(0)) {
            if (to != redemptionQueue && from != redemptionQueue) {
                if (identity.isFlagged(from)) revert CredentialRevoked(from);
                _requireEligible(to);
            }
        }
        // burns (to == address(0)) pass: caller auth already restricted.
        super._update(from, to, value);
    }

    function _requireEligible(address account) internal view {
        if (!identity.isVerified(account)) revert NotVerified(account);
        if (identity.isFlagged(account)) revert CredentialRevoked(account);
    }
}

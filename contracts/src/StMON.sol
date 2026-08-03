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
}

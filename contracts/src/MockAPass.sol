// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";

/// @notice Admin-driven mock of the Cleanverse A-Pass registry for the demo.
contract MockAPass is ICleanverseIdentity, Ownable {
    struct Record {
        bool verified;
        uint8 tier;
        bytes2 jurisdiction;
        bool flagged;
    }

    mapping(address => Record) internal _records;

    /// @notice May call `verify` and nothing else.
    ///
    /// The self-serve onboarding route signs from a web server, so its key is
    /// the most exposed one we hold. Giving it a role that can only admit
    /// wallets — never revoke, never change the compliance mode, never touch
    /// the vault — means a leak of that key costs us a polluted registry
    /// rather than the protocol.
    address public operator;

    event Verified(address indexed account, uint8 tier, bytes2 jurisdiction);
    event Revoked(address indexed account);
    event Reinstated(address indexed account);
    event OperatorChanged(address indexed operator);

    error NotOwnerOrOperator(address caller);

    constructor() Ownable(msg.sender) {}

    modifier onlyOwnerOrOperator() {
        if (msg.sender != owner() && msg.sender != operator) {
            revert NotOwnerOrOperator(msg.sender);
        }
        _;
    }

    /// @notice Set (or clear, with address(0)) the verify-only operator.
    function setOperator(address operator_) external onlyOwner {
        operator = operator_;
        emit OperatorChanged(operator_);
    }

    function verify(address account, uint8 tier, bytes2 jurisdiction)
        external
        onlyOwnerOrOperator
    {
        _records[account] = Record(true, tier, jurisdiction, false);
        emit Verified(account, tier, jurisdiction);
    }

    function revoke(address account) external onlyOwner {
        _records[account].flagged = true;
        emit Revoked(account);
    }

    function reinstate(address account) external onlyOwner {
        _records[account].flagged = false;
        emit Reinstated(account);
    }

    function isVerified(address account) external view returns (bool) {
        return _records[account].verified;
    }

    function tierOf(address account) external view returns (uint8) {
        return _records[account].tier;
    }

    function jurisdictionOf(address account) external view returns (bytes2) {
        return _records[account].jurisdiction;
    }

    function isFlagged(address account) external view returns (bool) {
        return _records[account].flagged;
    }
}

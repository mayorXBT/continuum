// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";
import {IAPassComplianceValidator} from "./interfaces/IAPassComplianceValidator.sol";

/// @title ComplianceRouter
/// @notice Puts the Cleanverse CVI validator alongside the local registry
/// rather than in place of it.
///
/// The router *is* an `ICleanverseIdentity`, so StMON, StakingVault, and
/// RedemptionQueue bind to it exactly as they bound to the registry — no
/// changes to any of them. Which source is authoritative is a runtime switch,
/// so the Cleanverse gate can be turned on (or off, if the sandbox is down)
/// without redeploying the protocol.
///
/// Division of labour:
///   - `isVerified` combines both sources, per `mode`.
///   - `isFlagged` stays local. The validator answers one question, pass/fail;
///     it has no separate notion of a revoked-but-known holder, and that
///     distinction is what makes a controlled exit possible.
///   - `tierOf` / `jurisdictionOf` stay local; the on-chain validator surface
///     does not expose the underlying attributes.
contract ComplianceRouter is ICleanverseIdentity, Ownable {
    enum Mode {
        LocalOnly, // ignore the validator entirely (default, safe)
        ValidatorOnly, // Cleanverse is authoritative
        RequireBoth, // strictest: local AND Cleanverse
        EitherPasses // most permissive: local OR Cleanverse
    }

    ICleanverseIdentity public local;
    IAPassComplianceValidator public validator;

    /// @notice Pool address presented to the validator. Rules are registered
    /// against a pool, so this is whichever of our contracts is registered —
    /// normally the router itself.
    address public pool;

    Mode public mode;

    event ModeChanged(Mode mode);
    event LocalChanged(address local);
    event ValidatorChanged(address validator, address pool);

    constructor(ICleanverseIdentity local_, IAPassComplianceValidator validator_, address pool_)
        Ownable(msg.sender)
    {
        require(address(local_) != address(0), "local=0");
        local = local_;
        validator = validator_;
        pool = pool_ == address(0) ? address(this) : pool_;
        mode = Mode.LocalOnly;
    }

    // ─────────────────────────── admin ───────────────────────────

    function setMode(Mode mode_) external onlyOwner {
        mode = mode_;
        emit ModeChanged(mode_);
    }

    function setLocal(ICleanverseIdentity local_) external onlyOwner {
        require(address(local_) != address(0), "local=0");
        local = local_;
        emit LocalChanged(address(local_));
    }

    function setValidator(IAPassComplianceValidator validator_, address pool_) external onlyOwner {
        validator = validator_;
        pool = pool_ == address(0) ? address(this) : pool_;
        emit ValidatorChanged(address(validator_), pool);
    }

    /// @notice Set this pool's rule on the validator. Only meaningful once the
    /// router has been registered through POST /validator/register.
    function setRuleV2(IAPassComplianceValidator.RuleV2 calldata rule) external onlyOwner {
        validator.setRuleV2FromContract(rule);
    }

    function addRuleV2(IAPassComplianceValidator.RuleV2 calldata rule) external onlyOwner {
        validator.addRuleV2FromContract(rule);
    }

    function removeRuleV2(uint256 index) external onlyOwner {
        validator.removeRuleV2FromContract(index);
    }

    // ─────────────────────── identity surface ───────────────────────

    /// @notice Ask the validator, tolerating an unreachable or unregistered
    /// pool. A revert there must not brick the protocol, so it is reported as
    /// "unavailable" and each mode decides what that means.
    function _askValidator(address account) internal view returns (bool ok, bool available) {
        if (address(validator) == address(0)) return (false, false);
        try validator.complianceVerify(pool, account) returns (bool result) {
            return (result, true);
        } catch {
            return (false, false);
        }
    }

    /// @notice Whether the validator is currently answering for this pool.
    /// Useful for surfacing live integration status in the UI.
    function validatorAvailable(address probe) external view returns (bool) {
        (, bool available) = _askValidator(probe);
        return available;
    }

    function isVerified(address account) external view returns (bool) {
        bool localOk = local.isVerified(account);

        if (mode == Mode.LocalOnly) return localOk;

        (bool remoteOk, bool available) = _askValidator(account);

        if (mode == Mode.ValidatorOnly) {
            // Fail closed: if Cleanverse cannot answer, nobody is verified.
            return available && remoteOk;
        }
        if (mode == Mode.RequireBoth) {
            return localOk && available && remoteOk;
        }
        // EitherPasses — an unavailable validator simply doesn't contribute.
        return localOk || (available && remoteOk);
    }

    function isFlagged(address account) external view returns (bool) {
        return local.isFlagged(account);
    }

    function tierOf(address account) external view returns (uint8) {
        return local.tierOf(account);
    }

    function jurisdictionOf(address account) external view returns (bytes2) {
        return local.jurisdictionOf(account);
    }
}

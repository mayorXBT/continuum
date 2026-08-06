// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Cleanverse's on-chain CVI compliance validator (CCP).
/// Deployed at 0xaC7e5179C2C7f03f209136886c172eb34F161792 on every chain in
/// the hackathon set, Monad testnet (10143) included.
///
/// Rule semantics: fields within one RuleV2 are AND; multiple RuleV2 entries
/// are OR; country bitmaps are compared with a bitwise AND.
interface IAPassComplianceValidator {
    struct RuleV2 {
        bytes2 allowedGroup; // empty = unrestricted
        bytes2 allowedSubGroup; // empty = unrestricted
        uint8 minTier; // 0 = unrestricted
        uint8 minSubTier; // 0 = unrestricted
        uint256 poolCountryBitmap; // 0 = unrestricted
    }

    /// @notice Does `userAddress` satisfy the rules registered for `poolAddress`?
    /// @dev View, and explicitly permissionless — this is the call a business
    /// contract makes at its own checkpoints.
    function complianceVerify(address poolAddress, address userAddress)
        external
        view
        returns (bool);

    function isRegistered(address poolAddress) external view returns (bool);

    function getRulesV2(address poolAddress) external view returns (RuleV2[] memory);

    // ── Rule self-management, callable by the registered pool itself ──
    function setRuleV2FromContract(RuleV2 calldata rule) external;
    function addRuleV2FromContract(RuleV2 calldata rule) external;
    function removeRuleV2FromContract(uint256 index) external;
}

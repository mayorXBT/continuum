// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal identity surface Continuum needs from Cleanverse A-Pass (CVI).
/// Implemented by MockAPass today; by SandboxAPassAdapter once API keys arrive.
interface ICleanverseIdentity {
    function isVerified(address account) external view returns (bool);
    function tierOf(address account) external view returns (uint8);
    function jurisdictionOf(address account) external view returns (bytes2);
    function isFlagged(address account) external view returns (bool);
}

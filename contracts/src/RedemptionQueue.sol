// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";
import {StMON} from "./StMON.sol";
import {StakingVault} from "./StakingVault.sol";

/// @notice Controlled exit: a revoked holder's shares cannot circulate but can
/// be redeemed to a verified receiver after compliance review.
/// "Compliance without confiscation." Owner = compliance officer.
contract RedemptionQueue is Ownable {
    enum Status {
        None,
        Pending,
        Approved,
        Settled,
        Rejected,
        Cancelled
    }

    struct Request {
        address requester;
        address receiver;
        uint256 shares;
        Status status;
    }

    ICleanverseIdentity public immutable identity;
    StMON public immutable stMON;
    StakingVault public immutable vault;

    uint256 public nextId;
    uint256 public totalLockedShares;
    mapping(uint256 => Request) public requests;

    error NotVerified(address account);
    error CredentialRevoked(address account);
    error NotAuthorized(address caller);
    error ZeroAmount();
    error BadStatus();

    event RedemptionRequested(
        uint256 indexed id, address indexed requester, address indexed receiver, uint256 shares
    );
    event RedemptionCancelled(uint256 indexed id);

    constructor(ICleanverseIdentity identity_, StMON stMON_, StakingVault vault_)
        Ownable(msg.sender)
    {
        identity = identity_;
        stMON = stMON_;
        vault = vault_;
    }

    function requestRedemption(uint256 shares, address receiver) external returns (uint256 id) {
        if (shares == 0) revert ZeroAmount();
        _requireEligible(receiver);
        stMON.transferFrom(msg.sender, address(this), shares);
        id = ++nextId;
        requests[id] = Request(msg.sender, receiver, shares, Status.Pending);
        totalLockedShares += shares;
        emit RedemptionRequested(id, msg.sender, receiver, shares);
    }

    function cancelRedemption(uint256 id) external {
        Request storage r = requests[id];
        if (r.requester != msg.sender) revert NotAuthorized(msg.sender);
        if (r.status != Status.Pending) revert BadStatus();
        r.status = Status.Cancelled;
        totalLockedShares -= r.shares;
        stMON.transfer(r.requester, r.shares);
        emit RedemptionCancelled(id);
    }

    event RedemptionApproved(uint256 indexed id);
    event RedemptionRejected(uint256 indexed id);
    event SettlementDeferred(uint256 indexed id, address receiver);
    event RedemptionSettled(
        uint256 indexed id, address indexed requester, address indexed receiver, uint256 assets
    );

    function approveRedemption(uint256 id) external onlyOwner {
        Request storage r = requests[id];
        if (r.status != Status.Pending) revert BadStatus();
        _requireEligible(r.receiver); // re-check at approval
        r.status = Status.Approved;
        emit RedemptionApproved(id);
    }

    function rejectRedemption(uint256 id) external onlyOwner {
        Request storage r = requests[id];
        if (r.status != Status.Pending) revert BadStatus();
        r.status = Status.Rejected;
        totalLockedShares -= r.shares;
        stMON.transfer(r.requester, r.shares);
        emit RedemptionRejected(id);
    }

    function settleRedemption(uint256 id) external onlyOwner {
        Request storage r = requests[id];
        if (r.status != Status.Approved) revert BadStatus();
        // Re-check at settlement: if the receiver went ineligible after
        // approval, the request returns to pending review.
        if (!identity.isVerified(r.receiver) || identity.isFlagged(r.receiver)) {
            r.status = Status.Pending;
            emit SettlementDeferred(id, r.receiver);
            return;
        }
        r.status = Status.Settled;
        totalLockedShares -= r.shares;
        uint256 assets = vault.settleRedemption(r.receiver, r.shares);
        emit RedemptionSettled(id, r.requester, r.receiver, assets);
    }

    function _requireEligible(address account) internal view {
        if (!identity.isVerified(account)) revert NotVerified(account);
        if (identity.isFlagged(account)) revert CredentialRevoked(account);
    }
}

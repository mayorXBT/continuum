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

    function _requireEligible(address account) internal view {
        if (!identity.isVerified(account)) revert NotVerified(account);
        if (identity.isFlagged(account)) revert CredentialRevoked(account);
    }
}

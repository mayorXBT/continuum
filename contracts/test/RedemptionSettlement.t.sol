// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";
import {StakingVault} from "../src/StakingVault.sol";
import {RedemptionQueue} from "../src/RedemptionQueue.sol";

contract RedemptionSettlementTest is Test {
    MockAPass apass;
    StMON token;
    StakingVault vault;
    RedemptionQueue queue;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        apass = new MockAPass();
        token = new StMON(apass);
        vault = new StakingVault(apass, token);
        queue = new RedemptionQueue(apass, token, vault);
        token.initialize(address(vault), address(queue));
        vault.setRedemptionQueue(address(queue));
        apass.verify(alice, 1, "SG");
        apass.verify(bob, 1, "SG");
        vm.deal(alice, 100 ether);
        vm.startPrank(alice);
        vault.stake{value: 10 ether}();
        token.approve(address(queue), type(uint256).max);
        vm.stopPrank();
        apass.revoke(alice); // the canonical scenario: revoked holder exits
    }

    function _request() internal returns (uint256 id) {
        vm.prank(alice);
        id = queue.requestRedemption(10 ether, bob);
    }

    function test_full_flow_delivers_underlying_and_burns_receipt() public {
        uint256 id = _request();
        queue.approveRedemption(id);
        uint256 before = bob.balance;
        queue.settleRedemption(id);
        assertEq(bob.balance - before, 10 ether); // underlying MON delivered
        assertEq(token.totalSupply(), 0); // receipt burned, never re-circulates
        assertEq(queue.totalLockedShares(), 0);
        (,,, RedemptionQueue.Status status) = queue.requests(id);
        assertEq(uint8(status), uint8(RedemptionQueue.Status.Settled));
    }

    function test_approve_rechecks_receiver() public {
        uint256 id = _request();
        apass.revoke(bob);
        vm.expectRevert(abi.encodeWithSelector(RedemptionQueue.CredentialRevoked.selector, bob));
        queue.approveRedemption(id);
    }

    function test_settle_defers_if_receiver_became_ineligible() public {
        uint256 id = _request();
        queue.approveRedemption(id);
        apass.revoke(bob); // receiver goes bad between approval and settlement
        queue.settleRedemption(id);
        (,,, RedemptionQueue.Status status) = queue.requests(id);
        assertEq(uint8(status), uint8(RedemptionQueue.Status.Pending)); // back to pending
        assertEq(token.balanceOf(address(queue)), 10 ether); // still locked
    }

    function test_reject_returns_shares_to_revoked_requester() public {
        uint256 id = _request();
        queue.rejectRedemption(id);
        assertEq(token.balanceOf(alice), 10 ether);
        (,,, RedemptionQueue.Status status) = queue.requests(id);
        assertEq(uint8(status), uint8(RedemptionQueue.Status.Rejected));
    }

    function test_only_officer_runs_review() public {
        uint256 id = _request();
        vm.startPrank(alice);
        vm.expectRevert();
        queue.approveRedemption(id);
        vm.expectRevert();
        queue.rejectRedemption(id);
        vm.expectRevert();
        queue.settleRedemption(id);
        vm.stopPrank();
    }

    function test_vault_settle_only_callable_by_queue() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(StakingVault.NotAuthorized.selector, alice));
        vault.settleRedemption(bob, 1 ether);
    }

    /// Invariant-style check: locked-share ledger always equals queue balance.
    function test_locked_ledger_matches_queue_balance_across_lifecycle() public {
        uint256 id = _request();
        assertEq(queue.totalLockedShares(), token.balanceOf(address(queue)));
        queue.approveRedemption(id);
        queue.settleRedemption(id);
        assertEq(queue.totalLockedShares(), token.balanceOf(address(queue)));
    }
}

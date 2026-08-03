// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";
import {StakingVault} from "../src/StakingVault.sol";
import {RedemptionQueue} from "../src/RedemptionQueue.sol";

contract RedemptionQueueTest is Test {
    MockAPass apass;
    StMON token;
    StakingVault vault;
    RedemptionQueue queue;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob"); // verified receiver
    address carol = makeAddr("carol"); // unverified

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
    }

    function test_revoked_holder_can_request() public {
        apass.revoke(alice);
        vm.prank(alice);
        uint256 id = queue.requestRedemption(10 ether, bob);
        (address requester, address receiver, uint256 shares, RedemptionQueue.Status status) =
            queue.requests(id);
        assertEq(requester, alice);
        assertEq(receiver, bob);
        assertEq(shares, 10 ether);
        assertEq(uint8(status), uint8(RedemptionQueue.Status.Pending));
        assertEq(token.balanceOf(address(queue)), 10 ether);
        assertEq(queue.totalLockedShares(), 10 ether);
    }

    function test_request_rejects_ineligible_receiver() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(RedemptionQueue.NotVerified.selector, carol));
        queue.requestRedemption(1 ether, carol);
    }

    function test_request_zero_shares_reverts() public {
        vm.prank(alice);
        vm.expectRevert(RedemptionQueue.ZeroAmount.selector);
        queue.requestRedemption(0, bob);
    }

    function test_cancel_returns_shares_even_when_revoked() public {
        apass.revoke(alice);
        vm.startPrank(alice);
        uint256 id = queue.requestRedemption(10 ether, bob);
        queue.cancelRedemption(id);
        vm.stopPrank();
        assertEq(token.balanceOf(alice), 10 ether);
        assertEq(queue.totalLockedShares(), 0);
        (,,, RedemptionQueue.Status status) = queue.requests(id);
        assertEq(uint8(status), uint8(RedemptionQueue.Status.Cancelled));
    }

    function test_only_requester_can_cancel() public {
        vm.prank(alice);
        uint256 id = queue.requestRedemption(1 ether, bob);
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(RedemptionQueue.NotAuthorized.selector, bob));
        queue.cancelRedemption(id);
    }
}

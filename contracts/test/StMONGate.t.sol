// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";

contract StMONGateTest is Test {
    MockAPass apass;
    StMON token;
    address vault = makeAddr("vault");
    address queue = makeAddr("queue");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol"); // never verified

    function setUp() public {
        apass = new MockAPass();
        token = new StMON(apass);
        token.initialize(vault, queue);
        apass.verify(alice, 1, "SG");
        apass.verify(bob, 1, "SG");
        vm.prank(vault);
        token.mint(alice, 100e18);
    }

    function test_transfer_between_verified_passes() public {
        vm.prank(alice);
        token.transfer(bob, 10e18);
        assertEq(token.balanceOf(bob), 10e18);
    }

    function test_transfer_to_unverified_blocked() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(StMON.NotVerified.selector, carol));
        token.transfer(carol, 10e18);
    }

    function test_transfer_to_flagged_recipient_blocked() public {
        apass.revoke(bob);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(StMON.CredentialRevoked.selector, bob));
        token.transfer(bob, 10e18);
    }

    function test_flagged_sender_blocked() public {
        apass.revoke(alice);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(StMON.CredentialRevoked.selector, alice));
        token.transfer(bob, 10e18);
    }

    function test_flagged_sender_may_send_to_queue() public {
        apass.revoke(alice);
        vm.prank(alice);
        token.transfer(queue, 25e18);
        assertEq(token.balanceOf(queue), 25e18);
    }

    function test_queue_may_return_to_flagged_holder() public {
        apass.revoke(alice);
        vm.prank(alice);
        token.transfer(queue, 25e18);
        vm.prank(queue);
        token.transfer(alice, 25e18);
        assertEq(token.balanceOf(alice), 100e18);
    }

    function test_mint_to_unverified_blocked() public {
        vm.prank(vault);
        vm.expectRevert(abi.encodeWithSelector(StMON.NotVerified.selector, carol));
        token.mint(carol, 1e18);
    }

    function test_burn_from_flagged_holder_allowed_for_vault() public {
        apass.revoke(alice);
        vm.prank(vault);
        token.burn(alice, 10e18);
        assertEq(token.balanceOf(alice), 90e18);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";

contract MockAPassTest is Test {
    MockAPass apass;
    address alice = makeAddr("alice");

    function setUp() public {
        apass = new MockAPass();
    }

    function test_unknown_address_is_unverified_and_unflagged() public view {
        assertFalse(apass.isVerified(alice));
        assertFalse(apass.isFlagged(alice));
    }

    function test_verify_sets_full_record() public {
        apass.verify(alice, 2, "SG");
        assertTrue(apass.isVerified(alice));
        assertEq(apass.tierOf(alice), 2);
        assertTrue(apass.jurisdictionOf(alice) == bytes2("SG"));
        assertFalse(apass.isFlagged(alice));
    }

    function test_revoke_flags_but_keeps_verified() public {
        apass.verify(alice, 2, "SG");
        apass.revoke(alice);
        assertTrue(apass.isVerified(alice));
        assertTrue(apass.isFlagged(alice));
    }

    function test_reinstate_clears_flag() public {
        apass.verify(alice, 2, "SG");
        apass.revoke(alice);
        apass.reinstate(alice);
        assertFalse(apass.isFlagged(alice));
    }

    function test_only_owner_can_mutate() public {
        vm.startPrank(alice);
        vm.expectRevert();
        apass.verify(alice, 1, "US");
        vm.expectRevert();
        apass.revoke(alice);
        vm.stopPrank();
    }

    // ───────────── verify-only operator ─────────────

    function test_operator_can_verify_but_not_revoke() public {
        address op = makeAddr("operator");
        apass.setOperator(op);
        assertEq(apass.operator(), op);

        vm.startPrank(op);
        apass.verify(alice, 60, "SG");
        assertTrue(apass.isVerified(alice));

        // The whole point: an exposed onboarding key must not be able to
        // revoke, only admit.
        vm.expectRevert();
        apass.revoke(alice);
        vm.expectRevert();
        apass.reinstate(alice);
        vm.expectRevert();
        apass.setOperator(address(0xBEEF));
        vm.stopPrank();
    }

    function test_owner_still_has_full_control() public {
        apass.setOperator(makeAddr("operator"));
        apass.verify(alice, 1, "SG");
        apass.revoke(alice);
        assertTrue(apass.isFlagged(alice));
        apass.reinstate(alice);
        assertFalse(apass.isFlagged(alice));
    }

    function test_non_operator_cannot_verify() public {
        address stranger = makeAddr("stranger");
        vm.prank(stranger);
        vm.expectRevert();
        apass.verify(alice, 1, "SG");
    }

    function test_clearing_operator_revokes_its_access() public {
        address op = makeAddr("operator");
        apass.setOperator(op);
        apass.setOperator(address(0));

        vm.prank(op);
        vm.expectRevert();
        apass.verify(alice, 1, "SG");
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";
import {StakingVault} from "../src/StakingVault.sol";

contract StakingVaultTest is Test {
    MockAPass apass;
    StMON token;
    StakingVault vault;
    address alice = makeAddr("alice");
    address carol = makeAddr("carol"); // unverified

    function setUp() public {
        apass = new MockAPass();
        token = new StMON(apass);
        vault = new StakingVault(apass, token);
        token.initialize(address(vault), makeAddr("queue"));
        apass.verify(alice, 1, "SG");
        vm.deal(alice, 100 ether);
        vm.deal(carol, 100 ether);
    }

    function test_first_stake_mints_one_to_one() public {
        vm.prank(alice);
        vault.stake{value: 10 ether}();
        assertEq(token.balanceOf(alice), 10 ether);
        assertEq(vault.totalAssets(), 10 ether);
        assertEq(vault.exchangeRate(), 1e18);
    }

    function test_unverified_cannot_stake() public {
        vm.prank(carol);
        vm.expectRevert(abi.encodeWithSelector(StakingVault.NotVerified.selector, carol));
        vault.stake{value: 1 ether}();
    }

    function test_flagged_cannot_stake_or_unstake() public {
        vm.prank(alice);
        vault.stake{value: 10 ether}();
        apass.revoke(alice);
        vm.startPrank(alice);
        vm.expectRevert(abi.encodeWithSelector(StakingVault.CredentialRevoked.selector, alice));
        vault.stake{value: 1 ether}();
        vm.expectRevert(abi.encodeWithSelector(StakingVault.CredentialRevoked.selector, alice));
        vault.unstake(1 ether);
        vm.stopPrank();
    }

    function test_zero_stake_reverts() public {
        vm.prank(alice);
        vm.expectRevert(StakingVault.ZeroAmount.selector);
        vault.stake{value: 0}();
    }

    function test_unstake_returns_assets() public {
        vm.startPrank(alice);
        vault.stake{value: 10 ether}();
        uint256 before = alice.balance;
        vault.unstake(4 ether);
        vm.stopPrank();
        assertEq(alice.balance - before, 4 ether);
        assertEq(token.balanceOf(alice), 6 ether);
        assertEq(vault.totalAssets(), 6 ether);
    }

    function test_pause_blocks_stake() public {
        vault.pause();
        vm.prank(alice);
        vm.expectRevert();
        vault.stake{value: 1 ether}();
    }
}

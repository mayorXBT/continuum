// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";

contract StMONTest is Test {
    MockAPass apass;
    StMON token;
    address vault = makeAddr("vault");
    address queue = makeAddr("queue");
    address alice = makeAddr("alice");

    function setUp() public {
        apass = new MockAPass();
        token = new StMON(apass);
        token.initialize(vault, queue);
        apass.verify(alice, 1, "SG");
    }

    function test_metadata() public view {
        assertEq(token.name(), "Continuum MON");
        assertEq(token.symbol(), "stMON");
    }

    function test_vault_can_mint_and_burn() public {
        vm.prank(vault);
        token.mint(alice, 100e18);
        assertEq(token.balanceOf(alice), 100e18);
        vm.prank(vault);
        token.burn(alice, 40e18);
        assertEq(token.balanceOf(alice), 60e18);
    }

    function test_non_vault_cannot_mint() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(StMON.NotAuthorized.selector, alice));
        token.mint(alice, 1e18);
    }

    function test_non_vault_cannot_burn() public {
        vm.prank(vault);
        token.mint(alice, 1e18);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(StMON.NotAuthorized.selector, alice));
        token.burn(alice, 1e18);
    }

    function test_initialize_only_once() public {
        vm.expectRevert(StMON.AlreadyInitialized.selector);
        token.initialize(vault, queue);
    }
}

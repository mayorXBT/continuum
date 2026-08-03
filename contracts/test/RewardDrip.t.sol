// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";
import {StakingVault} from "../src/StakingVault.sol";

contract RewardDripTest is Test {
    MockAPass apass;
    StMON token;
    StakingVault vault;
    address alice = makeAddr("alice");

    function setUp() public {
        apass = new MockAPass();
        token = new StMON(apass);
        vault = new StakingVault(apass, token);
        token.initialize(address(vault), makeAddr("queue"));
        apass.verify(alice, 1, "SG");
        vm.deal(alice, 100 ether);
        vm.prank(alice);
        vault.stake{value: 10 ether}();
    }

    function test_drip_raises_exchange_rate_not_supply() public {
        uint256 supplyBefore = token.totalSupply();
        vault.dripRewards{value: 1 ether}();
        assertEq(token.totalSupply(), supplyBefore);
        assertEq(vault.exchangeRate(), 1.1e18);
    }

    function test_unstake_after_drip_pays_yield() public {
        vault.dripRewards{value: 1 ether}();
        uint256 before = alice.balance;
        vm.prank(alice);
        vault.unstake(10 ether);
        assertEq(alice.balance - before, 11 ether);
    }

    function test_only_owner_can_drip() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert();
        vault.dripRewards{value: 1 ether}();
    }

    /// Accounting stays consistent and the rate never decreases from drips.
    function testFuzz_drips_never_lower_rate_and_balance_covers_assets(
        uint96 stakeAmt,
        uint96 dripAmt
    ) public {
        vm.assume(stakeAmt > 0);
        address bob = makeAddr("bob");
        apass.verify(bob, 1, "SG");
        vm.deal(bob, uint256(stakeAmt));
        vm.prank(bob);
        vault.stake{value: stakeAmt}();

        uint256 rateBefore = vault.exchangeRate();
        vm.deal(address(this), uint256(dripAmt));
        vault.dripRewards{value: dripAmt}();

        assertGe(vault.exchangeRate(), rateBefore);
        assertGe(address(vault).balance, vault.totalAssets());
    }
}

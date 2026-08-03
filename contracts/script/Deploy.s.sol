// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";
import {StakingVault} from "../src/StakingVault.sol";
import {RedemptionQueue} from "../src/RedemptionQueue.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        MockAPass apass = new MockAPass();
        StMON stMon = new StMON(apass);
        StakingVault vault = new StakingVault(apass, stMon);
        RedemptionQueue queue = new RedemptionQueue(apass, stMon, vault);

        stMon.initialize(address(vault), address(queue));
        vault.setRedemptionQueue(address(queue));

        console.log("MockAPass:      ", address(apass));
        console.log("StMON:          ", address(stMon));
        console.log("StakingVault:   ", address(vault));
        console.log("RedemptionQueue:", address(queue));

        vm.stopBroadcast();
    }
}

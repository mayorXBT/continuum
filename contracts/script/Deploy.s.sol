// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {StMON} from "../src/StMON.sol";
import {StakingVault} from "../src/StakingVault.sol";
import {RedemptionQueue} from "../src/RedemptionQueue.sol";
import {ComplianceRouter} from "../src/ComplianceRouter.sol";
import {IAPassComplianceValidator} from "../src/interfaces/IAPassComplianceValidator.sol";

contract Deploy is Script {
    /// Cleanverse CVI compliance validator. Same address on every chain in the
    /// hackathon set; confirmed deployed on Monad testnet (10143).
    address constant CLEANVERSE_VALIDATOR = 0xaC7e5179C2C7f03f209136886c172eb34F161792;

    function run() external {
        vm.startBroadcast();

        MockAPass apass = new MockAPass();

        // The router is the identity source the protocol binds to. It starts in
        // LocalOnly, so behaviour is identical to the registry-only deployment
        // until the router is registered with Cleanverse and the mode is
        // switched — no redeploy needed to turn the CVI gate on.
        ComplianceRouter router = new ComplianceRouter(
            apass, IAPassComplianceValidator(CLEANVERSE_VALIDATOR), address(0)
        );

        StMON stMon = new StMON(router);
        StakingVault vault = new StakingVault(router, stMon);
        RedemptionQueue queue = new RedemptionQueue(router, stMon, vault);

        stMon.initialize(address(vault), address(queue));
        vault.setRedemptionQueue(address(queue));

        console.log("MockAPass:        ", address(apass));
        console.log("ComplianceRouter: ", address(router));
        console.log("StMON:            ", address(stMon));
        console.log("StakingVault:     ", address(vault));
        console.log("RedemptionQueue:  ", address(queue));
        console.log("");
        console.log("Register the router as a compliance pool:");
        console.log("  POST /validator/register  contract_address =", address(router));

        vm.stopBroadcast();
    }
}

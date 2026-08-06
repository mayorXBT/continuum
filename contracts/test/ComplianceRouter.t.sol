// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockAPass} from "../src/MockAPass.sol";
import {ComplianceRouter} from "../src/ComplianceRouter.sol";
import {IAPassComplianceValidator} from "../src/interfaces/IAPassComplianceValidator.sol";

/// Stand-in for the Cleanverse validator, with the two behaviours that matter:
/// answering pass/fail, and being unreachable.
contract FakeValidator is IAPassComplianceValidator {
    mapping(address => mapping(address => bool)) public allowed;
    bool public shouldRevert;

    function setAllowed(address pool, address user, bool ok) external {
        allowed[pool][user] = ok;
    }

    function setShouldRevert(bool v) external {
        shouldRevert = v;
    }

    function complianceVerify(address pool, address user) external view returns (bool) {
        require(!shouldRevert, "pool not registered");
        return allowed[pool][user];
    }

    function isRegistered(address) external pure returns (bool) {
        return true;
    }

    function getRulesV2(address) external pure returns (RuleV2[] memory) {
        return new RuleV2[](0);
    }

    function setRuleV2FromContract(RuleV2 calldata) external {}
    function addRuleV2FromContract(RuleV2 calldata) external {}
    function removeRuleV2FromContract(uint256) external {}
}

contract ComplianceRouterTest is Test {
    MockAPass apass;
    FakeValidator validator;
    ComplianceRouter router;

    address alice = makeAddr("alice"); // local yes, cleanverse yes
    address bob = makeAddr("bob"); // local yes, cleanverse no
    address carol = makeAddr("carol"); // local no,  cleanverse yes
    address dave = makeAddr("dave"); // local no,  cleanverse no

    function setUp() public {
        apass = new MockAPass();
        validator = new FakeValidator();
        router = new ComplianceRouter(apass, validator, address(0));

        apass.verify(alice, 5, "SG");
        apass.verify(bob, 5, "SG");

        validator.setAllowed(address(router), alice, true);
        validator.setAllowed(address(router), carol, true);
    }

    function test_defaultsToLocalOnly() public view {
        assertEq(uint8(router.mode()), uint8(ComplianceRouter.Mode.LocalOnly));
        assertTrue(router.isVerified(alice));
        assertTrue(router.isVerified(bob)); // validator disagrees, but is ignored
        assertFalse(router.isVerified(carol));
    }

    function test_validatorOnly() public {
        router.setMode(ComplianceRouter.Mode.ValidatorOnly);
        assertTrue(router.isVerified(alice));
        assertFalse(router.isVerified(bob));
        assertTrue(router.isVerified(carol)); // local doesn't know them; Cleanverse does
        assertFalse(router.isVerified(dave));
    }

    function test_requireBoth() public {
        router.setMode(ComplianceRouter.Mode.RequireBoth);
        assertTrue(router.isVerified(alice));
        assertFalse(router.isVerified(bob));
        assertFalse(router.isVerified(carol));
        assertFalse(router.isVerified(dave));
    }

    function test_eitherPasses() public {
        router.setMode(ComplianceRouter.Mode.EitherPasses);
        assertTrue(router.isVerified(alice));
        assertTrue(router.isVerified(bob));
        assertTrue(router.isVerified(carol));
        assertFalse(router.isVerified(dave));
    }

    /// An unregistered pool makes complianceVerify revert. That must not brick
    /// the protocol — it degrades per mode instead of bubbling up.
    function test_validatorRevert_doesNotBubble() public {
        validator.setShouldRevert(true);

        router.setMode(ComplianceRouter.Mode.LocalOnly);
        assertTrue(router.isVerified(alice));

        router.setMode(ComplianceRouter.Mode.EitherPasses);
        assertTrue(router.isVerified(alice)); // falls back to local
        assertFalse(router.isVerified(carol)); // local says no, validator silent

        // Compliance gates fail closed when the authority is unreachable.
        router.setMode(ComplianceRouter.Mode.ValidatorOnly);
        assertFalse(router.isVerified(alice));

        router.setMode(ComplianceRouter.Mode.RequireBoth);
        assertFalse(router.isVerified(alice));
    }

    function test_unsetValidator_isTreatedAsUnavailable() public {
        ComplianceRouter bare =
            new ComplianceRouter(apass, IAPassComplianceValidator(address(0)), address(0));
        assertTrue(bare.isVerified(alice));

        bare.setMode(ComplianceRouter.Mode.ValidatorOnly);
        assertFalse(bare.isVerified(alice));
    }

    /// Revocation stays local: it is what distinguishes a known-but-revoked
    /// holder (who may take the controlled exit) from a stranger.
    function test_flaggingStaysLocal() public {
        router.setMode(ComplianceRouter.Mode.ValidatorOnly);
        apass.revoke(alice);
        assertTrue(router.isFlagged(alice));
        assertEq(router.tierOf(alice), 5);
        assertEq(router.jurisdictionOf(alice), bytes2("SG"));
    }

    function test_validatorAvailable() public {
        assertTrue(router.validatorAvailable(alice));
        validator.setShouldRevert(true);
        assertFalse(router.validatorAvailable(alice));
    }

    function test_onlyOwnerCanChangeMode() public {
        vm.prank(alice);
        vm.expectRevert();
        router.setMode(ComplianceRouter.Mode.ValidatorOnly);
    }
}

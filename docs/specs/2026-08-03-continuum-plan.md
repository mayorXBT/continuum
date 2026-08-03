# Continuum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permissioned liquid staking dApp on Monad testnet â€” verified users stake MON for a policy-gated receipt (stMON) with a controlled-exit path for revoked holders â€” submitted to the Cleanverse hackathon by 2026-08-09.

**Architecture:** Four Foundry contracts (MockAPass identity registry behind `ICleanverseIdentity`, StakingVault with exchange-rate accounting and simulated reward drip, StMON ERC-20 with a compliance gate in `_update` whose sole exception is the RedemptionQueue, RedemptionQueue with officer review and re-checked receiver eligibility). Next.js + wagmi single-page frontend with four panels. Mock-first: the sandbox adapter swaps in behind the same interface when API keys arrive.

**Tech Stack:** Solidity ^0.8.24, Foundry (forge/anvil), OpenZeppelin Contracts v5.x, Next.js 14+ (App Router, TypeScript, Tailwind), wagmi v2 + viem + @tanstack/react-query.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-03-Continuum-design.md` â€” read it before starting.
- stMON is called a **"Cleanverse policy-gated liquid staking receipt"** in ALL UI copy and docs â€” never "a CVA" or "an A-Token" (spec: Claims discipline).
- Reward drips are labeled **"simulated testnet rewards"** wherever shown in UI.
- Audit exports are labeled **"audit attribution"**, not "Travel Rule reporting".
- Commit messages: plain conventional commits, **no AI attribution lines of any kind**.
- Chain: Monad testnet â€” chainId **10143**, RPC `https://testnet-rpc.monad.xyz`, explorer `https://testnet.monadexplorer.com`, currency MON. **Verify these against docs.monad.xyz in Task 8 before deploying**; if they differ, update `web/src/lib/wagmi.ts` and `.env` accordingly.
- Contract layout under `contracts/` (Foundry root), frontend under `web/`.
- Every gated revert uses a custom error surfaced verbatim in the UI: `NotVerified(address)`, `CredentialRevoked(address)`, `NotAuthorized(address)`, `ZeroAmount()`, `BadStatus()`, `TransferFailed()`, `AlreadyInitialized()`.

---

### Task 1: Foundry scaffold + ICleanverseIdentity + MockAPass

**Files:**
- Create: `contracts/foundry.toml`, `contracts/src/interfaces/ICleanverseIdentity.sol`, `contracts/src/MockAPass.sol`
- Test: `contracts/test/MockAPass.t.sol`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `ICleanverseIdentity` with `isVerified(address) â†’ bool`, `tierOf(address) â†’ uint8`, `jurisdictionOf(address) â†’ bytes2`, `isFlagged(address) â†’ bool`; `MockAPass` with owner-only `verify(address,uint8,bytes2)`, `revoke(address)`, `reinstate(address)`. Revocation sets `flagged=true` but keeps `verified=true` (a revoked credential existed; an unverified one never did).

- [ ] **Step 1: Scaffold Foundry project inside the existing repo**

```bash
cd C:/Users/hp/Downloads/exca
forge init contracts --no-commit
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.1.0 --no-commit
rm src/Counter.sol test/Counter.t.sol script/Counter.s.sol
```

Replace `contracts/foundry.toml` with:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"
remappings = [
    "openzeppelin-contracts/=lib/openzeppelin-contracts/contracts/",
    "forge-std/=lib/forge-std/src/",
]
```

- [ ] **Step 2: Write the interface** â€” `contracts/src/interfaces/ICleanverseIdentity.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal identity surface Continuum needs from Cleanverse A-Pass (CVI).
/// Implemented by MockAPass today; by SandboxAPassAdapter once API keys arrive.
interface ICleanverseIdentity {
    function isVerified(address account) external view returns (bool);
    function tierOf(address account) external view returns (uint8);
    function jurisdictionOf(address account) external view returns (bytes2);
    function isFlagged(address account) external view returns (bool);
}
```

- [ ] **Step 3: Write the failing tests** â€” `contracts/test/MockAPass.t.sol`:

```solidity
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
}
```

- [ ] **Step 4: Run tests, verify they fail**

Run: `forge test --match-contract MockAPassTest -vv`
Expected: compilation failure â€” `MockAPass.sol` not found.

- [ ] **Step 5: Implement** â€” `contracts/src/MockAPass.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";

/// @notice Admin-driven mock of the Cleanverse A-Pass registry for the demo.
contract MockAPass is ICleanverseIdentity, Ownable {
    struct Record {
        bool verified;
        uint8 tier;
        bytes2 jurisdiction;
        bool flagged;
    }

    mapping(address => Record) internal _records;

    event Verified(address indexed account, uint8 tier, bytes2 jurisdiction);
    event Revoked(address indexed account);
    event Reinstated(address indexed account);

    constructor() Ownable(msg.sender) {}

    function verify(address account, uint8 tier, bytes2 jurisdiction) external onlyOwner {
        _records[account] = Record(true, tier, jurisdiction, false);
        emit Verified(account, tier, jurisdiction);
    }

    function revoke(address account) external onlyOwner {
        _records[account].flagged = true;
        emit Revoked(account);
    }

    function reinstate(address account) external onlyOwner {
        _records[account].flagged = false;
        emit Reinstated(account);
    }

    function isVerified(address account) external view returns (bool) {
        return _records[account].verified;
    }

    function tierOf(address account) external view returns (uint8) {
        return _records[account].tier;
    }

    function jurisdictionOf(address account) external view returns (bytes2) {
        return _records[account].jurisdiction;
    }

    function isFlagged(address account) external view returns (bool) {
        return _records[account].flagged;
    }
}
```

- [ ] **Step 6: Run tests, verify they pass**

Run: `forge test --match-contract MockAPassTest -vv`
Expected: 5 tests PASS.

- [ ] **Step 7: Commit**

```bash
cd C:/Users/hp/Downloads/exca
git add contracts .gitmodules
git commit -m "feat: scaffold Foundry project with ICleanverseIdentity and MockAPass"
```

---

### Task 2: StMON token â€” mint/burn authorization

**Files:**
- Create: `contracts/src/StMON.sol`
- Test: `contracts/test/StMON.t.sol`

**Interfaces:**
- Consumes: `ICleanverseIdentity`, `MockAPass` (Task 1).
- Produces: `StMON` ERC-20 ("Continuum MON", "stMON") with `initialize(address vault, address queue)` (owner, once), `mint(address,uint256)` / `burn(address,uint256)` (vault only), public `vault()`, `redemptionQueue()`, `identity()`. Gate added in Task 3.

- [ ] **Step 1: Write the failing tests** â€” `contracts/test/StMON.t.sol`:

```solidity
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `forge test --match-contract StMONTest -vv`
Expected: compilation failure â€” `StMON.sol` not found.

- [ ] **Step 3: Implement** â€” `contracts/src/StMON.sol` (gate comes in Task 3; only auth now):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";

/// @notice Cleanverse policy-gated liquid staking receipt.
/// Not a CVA/A-Token; CVA-native issuance is the upgrade path (spec: Claims discipline).
contract StMON is ERC20, Ownable {
    ICleanverseIdentity public immutable identity;
    address public vault;
    address public redemptionQueue;
    bool public initialized;

    error NotVerified(address account);
    error CredentialRevoked(address account);
    error NotAuthorized(address caller);
    error AlreadyInitialized();

    constructor(ICleanverseIdentity identity_)
        ERC20("Continuum MON", "stMON")
        Ownable(msg.sender)
    {
        identity = identity_;
    }

    function initialize(address vault_, address queue_) external onlyOwner {
        if (initialized) revert AlreadyInitialized();
        vault = vault_;
        redemptionQueue = queue_;
        initialized = true;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != vault) revert NotAuthorized(msg.sender);
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != vault) revert NotAuthorized(msg.sender);
        _burn(from, amount);
    }
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `forge test --match-contract StMONTest -vv`
Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add contracts/src/StMON.sol contracts/test/StMON.t.sol
git commit -m "feat: add StMON receipt token with vault-only mint/burn"
```

---

### Task 3: StMON compliance gate with redemption-queue exception

**Files:**
- Modify: `contracts/src/StMON.sol` (add `_update` override + `_requireEligible`)
- Test: `contracts/test/StMONGate.t.sol`

**Interfaces:**
- Consumes: `StMON`, `MockAPass` (Tasks 1â€“2).
- Produces: transfer semantics all later tasks rely on:
  - mint â†’ recipient must be verified and unflagged;
  - walletâ†”wallet transfer â†’ sender unflagged AND recipient verified+unflagged;
  - **any holder (incl. flagged) â†’ `redemptionQueue`: allowed** (escape hatch);
  - **`redemptionQueue` â†’ any address: allowed** (share returns on cancel/reject only â€” queue code never forwards elsewhere);
  - burns ungated at the token layer (mint/burn auth already restricts callers).

- [ ] **Step 1: Write the failing tests** â€” `contracts/test/StMONGate.t.sol`:

```solidity
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
```

- [ ] **Step 2: Run tests, verify the gate tests fail**

Run: `forge test --match-contract StMONGateTest -vv`
Expected: FAIL â€” transfers to `carol` and flagged cases succeed (no gate yet), so `expectRevert` assertions fail.

- [ ] **Step 3: Implement the gate** â€” add to `contracts/src/StMON.sol` (below `burn`):

```solidity
    /// @dev Compliance gate on every movement. Sole exception to the flagged-
    /// sender block: transfers to/from the RedemptionQueue, the controlled-exit
    /// path (spec: "compliance without confiscation"). The queue only ever
    /// locks, returns to requester, or burns â€” it never forwards.
    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0)) {
            _requireEligible(to); // mint
        } else if (to != address(0)) {
            if (to != redemptionQueue && from != redemptionQueue) {
                if (identity.isFlagged(from)) revert CredentialRevoked(from);
                _requireEligible(to);
            }
        }
        // burns (to == address(0)) pass: caller auth already restricted.
        super._update(from, to, value);
    }

    function _requireEligible(address account) internal view {
        if (!identity.isVerified(account)) revert NotVerified(account);
        if (identity.isFlagged(account)) revert CredentialRevoked(account);
    }
```

- [ ] **Step 4: Run the full suite, verify all pass**

Run: `forge test -vv`
Expected: all tests PASS (Tasks 1â€“3).

- [ ] **Step 5: Commit**

```bash
git add contracts/src/StMON.sol contracts/test/StMONGate.t.sol
git commit -m "feat: add compliance gate to stMON with redemption-queue exception"
```

---

### Task 4: StakingVault â€” stake, unstake, exchange rate

**Files:**
- Create: `contracts/src/StakingVault.sol`
- Test: `contracts/test/StakingVault.t.sol`

**Interfaces:**
- Consumes: `StMON.mint/burn`, `ICleanverseIdentity` (Tasks 1â€“3).
- Produces: `StakingVault` with `stake()` payable, `unstake(uint256 shares)`, `exchangeRate() â†’ uint256` (1e18-scaled), `totalAssets() â†’ uint256`, `setRedemptionQueue(address)` (owner, once), `pause()/unpause()` (owner). `dripRewards()` and `settleRedemption` come in Tasks 5 and 7.

- [ ] **Step 1: Write the failing tests** â€” `contracts/test/StakingVault.t.sol`:

```solidity
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `forge test --match-contract StakingVaultTest -vv`
Expected: compilation failure â€” `StakingVault.sol` not found.

- [ ] **Step 3: Implement** â€” `contracts/src/StakingVault.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {Pausable} from "openzeppelin-contracts/utils/Pausable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";
import {StMON} from "./StMON.sol";

/// @notice Permissioned liquid staking vault. Exchange-rate accounting;
/// rewards are a simulated testnet drip (Task 5), clearly labeled in the UI.
contract StakingVault is Ownable, Pausable {
    ICleanverseIdentity public immutable identity;
    StMON public immutable stMON;
    address public redemptionQueue;
    uint256 public totalAssets;

    error NotVerified(address account);
    error CredentialRevoked(address account);
    error NotAuthorized(address caller);
    error ZeroAmount();
    error TransferFailed();
    error AlreadyInitialized();

    event Staked(address indexed account, uint256 assets, uint256 shares);
    event Unstaked(address indexed account, uint256 assets, uint256 shares);

    constructor(ICleanverseIdentity identity_, StMON stMON_) Ownable(msg.sender) {
        identity = identity_;
        stMON = stMON_;
    }

    function setRedemptionQueue(address queue_) external onlyOwner {
        if (redemptionQueue != address(0)) revert AlreadyInitialized();
        redemptionQueue = queue_;
    }

    function stake() external payable whenNotPaused {
        if (msg.value == 0) revert ZeroAmount();
        _requireEligible(msg.sender);
        uint256 supply = stMON.totalSupply();
        uint256 shares = supply == 0 ? msg.value : (msg.value * supply) / totalAssets;
        totalAssets += msg.value;
        stMON.mint(msg.sender, shares);
        emit Staked(msg.sender, msg.value, shares);
    }

    function unstake(uint256 shares) external whenNotPaused {
        if (shares == 0) revert ZeroAmount();
        _requireEligible(msg.sender);
        uint256 assets = (shares * totalAssets) / stMON.totalSupply();
        stMON.burn(msg.sender, shares);
        totalAssets -= assets;
        (bool ok,) = msg.sender.call{value: assets}("");
        if (!ok) revert TransferFailed();
        emit Unstaked(msg.sender, assets, shares);
    }

    function exchangeRate() public view returns (uint256) {
        uint256 supply = stMON.totalSupply();
        return supply == 0 ? 1e18 : (totalAssets * 1e18) / supply;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _requireEligible(address account) internal view {
        if (!identity.isVerified(account)) revert NotVerified(account);
        if (identity.isFlagged(account)) revert CredentialRevoked(account);
    }
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `forge test --match-contract StakingVaultTest -vv`
Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add contracts/src/StakingVault.sol contracts/test/StakingVault.t.sol
git commit -m "feat: add StakingVault with gated stake/unstake and exchange-rate accounting"
```

---

### Task 5: Simulated reward drip + accounting properties

**Files:**
- Modify: `contracts/src/StakingVault.sol` (add `dripRewards`)
- Test: `contracts/test/RewardDrip.t.sol`

**Interfaces:**
- Consumes: `StakingVault` (Task 4).
- Produces: `dripRewards()` payable, owner-only, emits `RewardsDripped(uint256 amount, uint256 newExchangeRate)`. Raises `exchangeRate()` without minting shares.

- [ ] **Step 1: Write the failing tests** â€” `contracts/test/RewardDrip.t.sol`:

```solidity
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `forge test --match-contract RewardDripTest -vv`
Expected: compilation failure â€” `dripRewards` not defined.

- [ ] **Step 3: Implement** â€” add to `contracts/src/StakingVault.sol` (below `unstake`):

```solidity
    event RewardsDripped(uint256 amount, uint256 newExchangeRate);

    /// @notice Simulated testnet rewards: deposits raise stMON redemption
    /// value. Labeled "simulated testnet rewards" in all UI copy.
    function dripRewards() external payable onlyOwner {
        totalAssets += msg.value;
        emit RewardsDripped(msg.value, exchangeRate());
    }
```

- [ ] **Step 4: Run the full suite**

Run: `forge test -vv`
Expected: all tests PASS, including the fuzz test (256 runs).

- [ ] **Step 5: Commit**

```bash
git add contracts/src/StakingVault.sol contracts/test/RewardDrip.t.sol
git commit -m "feat: add simulated testnet reward drip with fuzzed accounting checks"
```

---

### Task 6: RedemptionQueue â€” request and cancel

**Files:**
- Create: `contracts/src/RedemptionQueue.sol`
- Test: `contracts/test/RedemptionQueue.t.sol`

**Interfaces:**
- Consumes: `StMON` transfer semantics (Task 3), `StakingVault` (Task 4), `ICleanverseIdentity`.
- Produces: `RedemptionQueue` with `requestRedemption(uint256 shares, address receiver) â†’ uint256 id` (receiver eligibility checked at request; pulls stMON via `transferFrom` â€” requester must `approve` the queue first), `cancelRedemption(uint256 id)` (requester, pending only, returns shares), `requests(uint256) â†’ (address requester, address receiver, uint256 shares, Status)`, `totalLockedShares() â†’ uint256`, `Status` enum `{None, Pending, Approved, Settled, Rejected, Cancelled}`. Officer actions come in Task 7.

- [ ] **Step 1: Write the failing tests** â€” `contracts/test/RedemptionQueue.t.sol`:

```solidity
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
    address bob = makeAddr("bob");   // verified receiver
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `forge test --match-contract RedemptionQueueTest -vv`
Expected: compilation failure â€” `RedemptionQueue.sol` not found.

- [ ] **Step 3: Implement** â€” `contracts/src/RedemptionQueue.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {ICleanverseIdentity} from "./interfaces/ICleanverseIdentity.sol";
import {StMON} from "./StMON.sol";
import {StakingVault} from "./StakingVault.sol";

/// @notice Controlled exit: a revoked holder's shares cannot circulate but can
/// be redeemed to a verified receiver after compliance review.
/// "Compliance without confiscation." Owner = compliance officer.
contract RedemptionQueue is Ownable {
    enum Status {
        None,
        Pending,
        Approved,
        Settled,
        Rejected,
        Cancelled
    }

    struct Request {
        address requester;
        address receiver;
        uint256 shares;
        Status status;
    }

    ICleanverseIdentity public immutable identity;
    StMON public immutable stMON;
    StakingVault public immutable vault;

    uint256 public nextId;
    uint256 public totalLockedShares;
    mapping(uint256 => Request) public requests;

    error NotVerified(address account);
    error CredentialRevoked(address account);
    error NotAuthorized(address caller);
    error ZeroAmount();
    error BadStatus();

    event RedemptionRequested(
        uint256 indexed id, address indexed requester, address indexed receiver, uint256 shares
    );
    event RedemptionCancelled(uint256 indexed id);

    constructor(ICleanverseIdentity identity_, StMON stMON_, StakingVault vault_)
        Ownable(msg.sender)
    {
        identity = identity_;
        stMON = stMON_;
        vault = vault_;
    }

    function requestRedemption(uint256 shares, address receiver) external returns (uint256 id) {
        if (shares == 0) revert ZeroAmount();
        _requireEligible(receiver);
        stMON.transferFrom(msg.sender, address(this), shares);
        id = ++nextId;
        requests[id] = Request(msg.sender, receiver, shares, Status.Pending);
        totalLockedShares += shares;
        emit RedemptionRequested(id, msg.sender, receiver, shares);
    }

    function cancelRedemption(uint256 id) external {
        Request storage r = requests[id];
        if (r.requester != msg.sender) revert NotAuthorized(msg.sender);
        if (r.status != Status.Pending) revert BadStatus();
        r.status = Status.Cancelled;
        totalLockedShares -= r.shares;
        stMON.transfer(r.requester, r.shares);
        emit RedemptionCancelled(id);
    }

    function _requireEligible(address account) internal view {
        if (!identity.isVerified(account)) revert NotVerified(account);
        if (identity.isFlagged(account)) revert CredentialRevoked(account);
    }
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `forge test --match-contract RedemptionQueueTest -vv`
Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add contracts/src/RedemptionQueue.sol contracts/test/RedemptionQueue.t.sol
git commit -m "feat: add RedemptionQueue request and cancel with locked shares"
```

---

### Task 7: Officer review â€” approve, reject, settle with re-checked eligibility

**Files:**
- Modify: `contracts/src/RedemptionQueue.sol` (officer functions), `contracts/src/StakingVault.sol` (add `settleRedemption`)
- Test: `contracts/test/RedemptionSettlement.t.sol`

**Interfaces:**
- Consumes: Tasks 4â€“6.
- Produces:
  - `RedemptionQueue.approveRedemption(uint256 id)` â€” owner; pending only; re-checks receiver eligibility; â†’ Approved.
  - `RedemptionQueue.rejectRedemption(uint256 id)` â€” owner; pending only; returns shares to requester; â†’ Rejected.
  - `RedemptionQueue.settleRedemption(uint256 id)` â€” owner; approved only; if receiver became ineligible â†’ status back to Pending + `SettlementDeferred(id)` event (no revert, state change is the point); else burns shares via `StakingVault.settleRedemption(receiver, shares)` which sends MON to receiver; â†’ Settled, emits `RedemptionSettled(id, assets)` with requester/receiver attribution ("audit attribution" â€” see Global Constraints).
  - `StakingVault.settleRedemption(address receiver, uint256 shares) â†’ uint256 assets` â€” callable only by the queue.

- [ ] **Step 1: Write the failing tests** â€” `contracts/test/RedemptionSettlement.t.sol`:

```solidity
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
        assertEq(bob.balance - before, 10 ether);       // underlying MON delivered
        assertEq(token.totalSupply(), 0);               // receipt burned, never re-circulates
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
        assertEq(token.balanceOf(address(queue)), 10 ether);            // still locked
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `forge test --match-contract RedemptionSettlementTest -vv`
Expected: compilation failure â€” `approveRedemption` / `settleRedemption` not defined.

- [ ] **Step 3: Implement.** Add to `contracts/src/StakingVault.sol` (below `dripRewards`):

```solidity
    event RedemptionSettled(address indexed receiver, uint256 assets, uint256 shares);

    /// @notice Burns queue-locked shares and delivers underlying MON to the
    /// reviewed, eligible receiver. Only the RedemptionQueue may call.
    function settleRedemption(address receiver, uint256 shares) external returns (uint256 assets) {
        if (msg.sender != redemptionQueue) revert NotAuthorized(msg.sender);
        assets = (shares * totalAssets) / stMON.totalSupply();
        stMON.burn(redemptionQueue, shares);
        totalAssets -= assets;
        (bool ok,) = receiver.call{value: assets}("");
        if (!ok) revert TransferFailed();
        emit RedemptionSettled(receiver, assets, shares);
    }
```

Note: `StMON.burn` is vault-only (Task 2), and here the vault burns *from the queue's balance* â€” no StMON change needed.

Add to `contracts/src/RedemptionQueue.sol` (below `cancelRedemption`):

```solidity
    event RedemptionApproved(uint256 indexed id);
    event RedemptionRejected(uint256 indexed id);
    event SettlementDeferred(uint256 indexed id, address receiver);
    event RedemptionSettled(
        uint256 indexed id, address indexed requester, address indexed receiver, uint256 assets
    );

    function approveRedemption(uint256 id) external onlyOwner {
        Request storage r = requests[id];
        if (r.status != Status.Pending) revert BadStatus();
        _requireEligible(r.receiver); // re-check at approval
        r.status = Status.Approved;
        emit RedemptionApproved(id);
    }

    function rejectRedemption(uint256 id) external onlyOwner {
        Request storage r = requests[id];
        if (r.status != Status.Pending) revert BadStatus();
        r.status = Status.Rejected;
        totalLockedShares -= r.shares;
        stMON.transfer(r.requester, r.shares);
        emit RedemptionRejected(id);
    }

    function settleRedemption(uint256 id) external onlyOwner {
        Request storage r = requests[id];
        if (r.status != Status.Approved) revert BadStatus();
        // Re-check at settlement: if the receiver went ineligible after
        // approval, the request returns to pending review (spec).
        if (!identity.isVerified(r.receiver) || identity.isFlagged(r.receiver)) {
            r.status = Status.Pending;
            emit SettlementDeferred(id, r.receiver);
            return;
        }
        r.status = Status.Settled;
        totalLockedShares -= r.shares;
        uint256 assets = vault.settleRedemption(r.receiver, r.shares);
        emit RedemptionSettled(id, r.requester, r.receiver, assets);
    }
```

- [ ] **Step 4: Run the full suite**

Run: `forge test -vv`
Expected: all tests PASS across all contracts.

- [ ] **Step 5: Commit**

```bash
git add contracts/src contracts/test
git commit -m "feat: add officer review and settlement with re-checked receiver eligibility"
```

---

### Task 8: Deploy script + Monad testnet deployment

**Files:**
- Create: `contracts/script/Deploy.s.sol`, `contracts/.env.example`
- Modify: `contracts/foundry.toml` (rpc endpoint)

**Interfaces:**
- Consumes: all contracts (Tasks 1â€“7).
- Produces: deployed addresses on Monad testnet, written to `contracts/deployments.md`, consumed by the frontend (Task 9) via `web/.env.local`.

- [ ] **Step 1: Verify chain parameters** against https://docs.monad.xyz (chainId 10143, RPC `https://testnet-rpc.monad.xyz`). If they differ, use the documented values everywhere below. Get testnet MON for the deployer wallet from the Monad faucet (linked from the docs); you need roughly 2 MON for deploys plus demo amounts.

- [ ] **Step 2: Write the deploy script** â€” `contracts/script/Deploy.s.sol`:

```solidity
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
```

Create `contracts/.env.example`:

```bash
PRIVATE_KEY=0xYOUR_DEPLOYER_KEY
MONAD_RPC=https://testnet-rpc.monad.xyz
```

Append to `contracts/foundry.toml`:

```toml
[rpc_endpoints]
monad_testnet = "${MONAD_RPC}"
```

- [ ] **Step 3: Dry-run locally**

```bash
cd contracts
forge script script/Deploy.s.sol --fork-url https://testnet-rpc.monad.xyz
```

Expected: simulation succeeds, four addresses logged.

- [ ] **Step 4: Deploy** (copy `.env.example` â†’ `.env`, fill in the key; NEVER commit `.env`)

```bash
forge script script/Deploy.s.sol --rpc-url monad_testnet --private-key $PRIVATE_KEY --broadcast
```

Expected: 4 contracts deployed; record the addresses in `contracts/deployments.md` (create it: chain, date, four addresses, deployer). Verify one address exists on https://testnet.monadexplorer.com.

- [ ] **Step 5: Commit** (confirm `.env` is git-ignored first: `git check-ignore contracts/.env` must print the path â€” Foundry's default `.gitignore` covers it; if not, add it)

```bash
git add contracts/script/Deploy.s.sol contracts/.env.example contracts/foundry.toml contracts/deployments.md
git commit -m "feat: add deploy script and Monad testnet deployment addresses"
```

---

### Task 9: Frontend scaffold â€” wagmi config, connect, verify panel

**Files:**
- Create: `web/` (create-next-app), `web/src/lib/wagmi.ts`, `web/src/lib/contracts.ts`, `web/src/app/providers.tsx`, `web/src/components/VerifyPanel.tsx`
- Modify: `web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/.env.local`

**Interfaces:**
- Consumes: deployed addresses (Task 8), contract ABIs from `contracts/out/`.
- Produces: `config` (wagmi), `CONTRACTS` map `{ apass, stMon, vault, queue }` with `address` + `abi`, `useIdentity(address)` pattern used by Tasks 10â€“11. App shell with tab navigation: Verify | Stake | Transfer | Console.

- [ ] **Step 1: Scaffold and install**

```bash
cd C:/Users/hp/Downloads/exca
npx create-next-app@latest web --ts --app --tailwind --no-eslint --src-dir --use-npm --yes
cd web
npm i wagmi viem @tanstack/react-query
```

- [ ] **Step 2: Export ABIs from Foundry**

```bash
cd ../contracts
forge build
mkdir -p ../web/src/lib/abi
forge inspect MockAPass abi --json > ../web/src/lib/abi/MockAPass.json
forge inspect StMON abi --json > ../web/src/lib/abi/StMON.json
forge inspect StakingVault abi --json > ../web/src/lib/abi/StakingVault.json
forge inspect RedemptionQueue abi --json > ../web/src/lib/abi/RedemptionQueue.json
```

- [ ] **Step 3: Write config.** `web/.env.local` (values from `contracts/deployments.md`):

```bash
NEXT_PUBLIC_APASS=0x...
NEXT_PUBLIC_STMON=0x...
NEXT_PUBLIC_VAULT=0x...
NEXT_PUBLIC_QUEUE=0x...
```

`web/src/lib/wagmi.ts`:

```ts
import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
});

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: { [monadTestnet.id]: http() },
});
```

`web/src/lib/contracts.ts`:

```ts
import MockAPass from "./abi/MockAPass.json";
import StMON from "./abi/StMON.json";
import StakingVault from "./abi/StakingVault.json";
import RedemptionQueue from "./abi/RedemptionQueue.json";

export const CONTRACTS = {
  apass: { address: process.env.NEXT_PUBLIC_APASS as `0x${string}`, abi: MockAPass },
  stMon: { address: process.env.NEXT_PUBLIC_STMON as `0x${string}`, abi: StMON },
  vault: { address: process.env.NEXT_PUBLIC_VAULT as `0x${string}`, abi: StakingVault },
  queue: { address: process.env.NEXT_PUBLIC_QUEUE as `0x${string}`, abi: RedemptionQueue },
} as const;
```

`web/src/app/providers.tsx`:

```tsx
"use client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../lib/wagmi";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
```

Wrap `children` with `<Providers>` in `web/src/app/layout.tsx` (import from `"./providers"`).

- [ ] **Step 4: Write the verify panel** â€” `web/src/components/VerifyPanel.tsx`:

```tsx
"use client";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS } from "../lib/contracts";

export function VerifyPanel() {
  const { address } = useAccount();
  const { writeContract, isPending, error } = useWriteContract();

  const { data: verified } = useReadContract({
    ...CONTRACTS.apass, functionName: "isVerified",
    args: [address!], query: { enabled: !!address, refetchInterval: 4000 },
  });
  const { data: flagged } = useReadContract({
    ...CONTRACTS.apass, functionName: "isFlagged",
    args: [address!], query: { enabled: !!address, refetchInterval: 4000 },
  });

  if (!address) return <p>Connect a wallet to check A-Pass status.</p>;

  const status = flagged ? "REVOKED" : verified ? "VERIFIED" : "UNVERIFIED";
  const color = flagged ? "text-red-600" : verified ? "text-green-600" : "text-yellow-600";

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">A-Pass status (mock CVI registry)</h2>
      <p>
        {address}: <span className={`font-bold ${color}`}>{status}</span>
      </p>
      <div className="flex gap-2">
        <button
          className="rounded bg-green-700 px-3 py-1 text-white disabled:opacity-50"
          disabled={isPending}
          onClick={() =>
            writeContract({
              ...CONTRACTS.apass, functionName: "verify",
              args: [address, 1, "0x5347"], // tier 1, "SG"
            })
          }
        >
          Verify this wallet
        </button>
        <button
          className="rounded bg-red-700 px-3 py-1 text-white disabled:opacity-50"
          disabled={isPending}
          onClick={() =>
            writeContract({ ...CONTRACTS.apass, functionName: "revoke", args: [address] })
          }
        >
          Revoke credential
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <p className="text-xs text-gray-500">
        Demo registry: admin actions run from the deployer wallet. Swaps for the
        Cleanverse sandbox A-Pass adapter behind the same interface.
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Wire the page shell** â€” replace `web/src/app/page.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { VerifyPanel } from "../components/VerifyPanel";

const TABS = ["Verify", "Stake", "Transfer", "Console"] as const;

export default function Home() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Verify");
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Continuum</h1>
          <p className="text-sm text-gray-500">
            Cleanverse policy-gated liquid staking receipt on Monad testnet
          </p>
        </div>
        {isConnected ? (
          <button className="rounded border px-3 py-1" onClick={() => disconnect()}>
            {address?.slice(0, 6)}â€¦{address?.slice(-4)} (disconnect)
          </button>
        ) : (
          <button
            className="rounded bg-black px-3 py-1 text-white"
            onClick={() => connect({ connector: injected() })}
          >
            Connect wallet
          </button>
        )}
      </header>
      <nav className="flex gap-2 border-b pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded ${tab === t ? "bg-black text-white" : "border"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {tab === "Verify" && <VerifyPanel />}
      {tab === "Stake" && <p>Stake panel â€” Task 10</p>}
      {tab === "Transfer" && <p>Transfer panel â€” Task 11</p>}
      {tab === "Console" && <p>Compliance console â€” Task 11</p>}
    </main>
  );
}
```

- [ ] **Step 6: Run and verify manually**

```bash
cd web && npm run dev
```

Open http://localhost:3000 â€” connect the deployer wallet (has owner rights on MockAPass), verify it, see status flip to VERIFIED, revoke, see REVOKED. Header copy reads "policy-gated liquid staking receipt" (claims discipline).

- [ ] **Step 7: Commit**

```bash
git add web
git commit -m "feat: scaffold Next.js frontend with wagmi config and verify panel"
```

---

### Task 10: Stake dashboard panel

**Files:**
- Create: `web/src/components/StakePanel.tsx`
- Modify: `web/src/app/page.tsx` (render it in the Stake tab)

**Interfaces:**
- Consumes: `CONTRACTS`, vault functions `stake()/unstake()/exchangeRate()/totalAssets()/dripRewards()`, `stMON.balanceOf`.
- Produces: the stake view used in demo beats 1â€“2.

- [ ] **Step 1: Write the panel** â€” `web/src/components/StakePanel.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "../lib/contracts";

export function StakePanel() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("1");
  const { writeContract, isPending, error } = useWriteContract();

  const { data: balance } = useReadContract({
    ...CONTRACTS.stMon, functionName: "balanceOf",
    args: [address!], query: { enabled: !!address, refetchInterval: 4000 },
  });
  const { data: rate } = useReadContract({
    ...CONTRACTS.vault, functionName: "exchangeRate",
    query: { refetchInterval: 4000 },
  });
  const { data: totalAssets } = useReadContract({
    ...CONTRACTS.vault, functionName: "totalAssets",
    query: { refetchInterval: 4000 },
  });

  const fmt = (v?: unknown) => (v ? Number(formatEther(v as bigint)).toFixed(4) : "0");

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Stake MON â†’ stMON</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">Your stMON</div>
          <div className="text-lg font-bold">{fmt(balance)}</div>
        </div>
        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">Exchange rate (MON/stMON)</div>
          <div className="text-lg font-bold">{fmt(rate)}</div>
        </div>
        <div className="rounded border p-3">
          <div className="text-xs text-gray-500">Vault assets (MON)</div>
          <div className="text-lg font-bold">{fmt(totalAssets)}</div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <input
          className="w-32 rounded border px-2 py-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
          disabled={isPending}
          onClick={() =>
            writeContract({
              ...CONTRACTS.vault, functionName: "stake", value: parseEther(amount),
            })
          }
        >
          Stake
        </button>
        <button
          className="rounded border px-3 py-1 disabled:opacity-50"
          disabled={isPending}
          onClick={() =>
            writeContract({
              ...CONTRACTS.vault, functionName: "unstake", args: [parseEther(amount)],
            })
          }
        >
          Unstake
        </button>
        <button
          className="rounded border border-dashed px-3 py-1 disabled:opacity-50"
          disabled={isPending}
          title="Owner only"
          onClick={() =>
            writeContract({
              ...CONTRACTS.vault, functionName: "dripRewards", value: parseEther("0.1"),
            })
          }
        >
          Drip simulated testnet rewards (+0.1)
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <p className="text-xs text-gray-500">
        Rewards shown are simulated testnet rewards raising stMON redemption value.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Render it** â€” in `web/src/app/page.tsx`, import `StakePanel` and replace the Stake placeholder: `{tab === "Stake" && <StakePanel />}`.

- [ ] **Step 3: Verify manually** â€” with a verified wallet: stake 1 MON, see balance 1.0 stMON and rate 1.0; drip rewards from the deployer wallet, watch rate rise above 1.0; unstake part, receive more MON than staked pro-rata. With a revoked wallet: stake reverts and the `CredentialRevoked` error string shows in the panel.

- [ ] **Step 4: Commit**

```bash
git add web/src
git commit -m "feat: add stake dashboard with simulated reward drip"
```

---

### Task 11: Transfer panel + compliance console

**Files:**
- Create: `web/src/components/TransferPanel.tsx`, `web/src/components/CompliancePanel.tsx`
- Modify: `web/src/app/page.tsx` (render both)

**Interfaces:**
- Consumes: `CONTRACTS`; `stMON.transfer/approve`; queue functions `requestRedemption/approveRedemption/rejectRedemption/settleRedemption/requests/nextId`; MockAPass admin.
- Produces: demo beats 3â€“7 (blocked transfer, revocation, controlled exit, audit view).

- [ ] **Step 1: Write the transfer panel** â€” `web/src/components/TransferPanel.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "../lib/contracts";

export function TransferPanel() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");
  const [receiver, setReceiver] = useState("");
  const { writeContract, isPending, error, isSuccess } = useWriteContract();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Transfer stMON</h2>
        <p className="text-xs text-gray-500">
          Every transfer is checked against the recipient&apos;s A-Pass. Unverified
          or revoked recipients are blocked at the token layer.
        </p>
        <div className="flex gap-2">
          <input className="flex-1 rounded border px-2 py-1" placeholder="0xRecipient"
            value={to} onChange={(e) => setTo(e.target.value)} />
          <input className="w-24 rounded border px-2 py-1"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button
            className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.stMon, functionName: "transfer",
                args: [to as `0x${string}`, parseEther(amount)],
              })
            }
          >
            Send
          </button>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <h2 className="text-xl font-semibold">Controlled exit (revoked holders)</h2>
        <p className="text-xs text-gray-500">
          A revoked wallet cannot transfer â€” but it can request redemption to a
          verified receiver. Compliance without confiscation.
        </p>
        <div className="flex gap-2">
          <input className="flex-1 rounded border px-2 py-1" placeholder="0xVerifiedReceiver"
            value={receiver} onChange={(e) => setReceiver(e.target.value)} />
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.stMon, functionName: "approve",
                args: [CONTRACTS.queue.address, parseEther(amount)],
              })
            }
          >
            1. Approve queue
          </button>
          <button
            className="rounded bg-black px-3 py-1 text-white disabled:opacity-50"
            disabled={isPending}
            onClick={() =>
              writeContract({
                ...CONTRACTS.queue, functionName: "requestRedemption",
                args: [parseEther(amount), receiver as `0x${string}`],
              })
            }
          >
            2. Request redemption
          </button>
        </div>
      </div>

      {isSuccess && <p className="text-sm text-green-600">Transaction confirmed.</p>}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </section>
  );
}
```

- [ ] **Step 2: Write the console** â€” `web/src/components/CompliancePanel.tsx`:

```tsx
"use client";
import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { CONTRACTS } from "../lib/contracts";

const STATUS = ["None", "Pending", "Approved", "Settled", "Rejected", "Cancelled"];

function RequestRow({ id }: { id: bigint }) {
  const { writeContract, isPending, error } = useWriteContract();
  const { data } = useReadContract({
    ...CONTRACTS.queue, functionName: "requests",
    args: [id], query: { refetchInterval: 4000 },
  });
  if (!data) return null;
  const [requester, receiver, shares, status] = data as [string, string, bigint, number];
  return (
    <tr className="border-t text-sm">
      <td className="p-2">{id.toString()}</td>
      <td className="p-2">{requester.slice(0, 8)}â€¦</td>
      <td className="p-2">{receiver.slice(0, 8)}â€¦</td>
      <td className="p-2">{Number(formatEther(shares)).toFixed(2)}</td>
      <td className="p-2 font-semibold">{STATUS[status]}</td>
      <td className="p-2 flex gap-1">
        <button className="rounded border px-2 disabled:opacity-50" disabled={isPending}
          onClick={() => writeContract({ ...CONTRACTS.queue, functionName: "approveRedemption", args: [id] })}>
          Approve
        </button>
        <button className="rounded border px-2 disabled:opacity-50" disabled={isPending}
          onClick={() => writeContract({ ...CONTRACTS.queue, functionName: "settleRedemption", args: [id] })}>
          Settle
        </button>
        <button className="rounded border px-2 disabled:opacity-50" disabled={isPending}
          onClick={() => writeContract({ ...CONTRACTS.queue, functionName: "rejectRedemption", args: [id] })}>
          Reject
        </button>
        {error && <span className="text-xs text-red-600">{error.message.slice(0, 80)}</span>}
      </td>
    </tr>
  );
}

export function CompliancePanel() {
  const [target, setTarget] = useState("");
  const { writeContract, isPending } = useWriteContract();
  const { data: nextId } = useReadContract({
    ...CONTRACTS.queue, functionName: "nextId", query: { refetchInterval: 4000 },
  });

  const ids: bigint[] = [];
  for (let i = 1n; i <= ((nextId as bigint) ?? 0n); i++) ids.push(i);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Officer: identity registry</h2>
        <div className="flex gap-2">
          <input className="flex-1 rounded border px-2 py-1" placeholder="0xWallet"
            value={target} onChange={(e) => setTarget(e.target.value)} />
          <button className="rounded bg-green-700 px-3 py-1 text-white disabled:opacity-50"
            disabled={isPending}
            onClick={() => writeContract({ ...CONTRACTS.apass, functionName: "verify", args: [target as `0x${string}`, 1, "0x5347"] })}>
            Verify
          </button>
          <button className="rounded bg-red-700 px-3 py-1 text-white disabled:opacity-50"
            disabled={isPending}
            onClick={() => writeContract({ ...CONTRACTS.apass, functionName: "revoke", args: [target as `0x${string}`] })}>
            Revoke
          </button>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <h2 className="text-xl font-semibold">Redemption review queue</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="p-2">ID</th><th className="p-2">Requester</th>
              <th className="p-2">Receiver</th><th className="p-2">Shares</th>
              <th className="p-2">Status</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>{ids.map((id) => <RequestRow key={id.toString()} id={id} />)}</tbody>
        </table>
        <p className="text-xs text-gray-500">
          Audit attribution: every request, approval, deferral, and settlement is
          an on-chain event with requester/receiver attribution, exportable from
          the explorer event log.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Render both** â€” in `web/src/app/page.tsx`: `{tab === "Transfer" && <TransferPanel />}` and `{tab === "Console" && <CompliancePanel />}`.

- [ ] **Step 4: Verify manually** â€” two-wallet run-through: transfer stMON to a verified wallet (succeeds), to an unverified one (error surfaces `NotVerified`), revoke wallet B from the console, wallet B's transfer fails, wallet B approves + requests redemption to a verified receiver, officer approves + settles, receiver's MON balance rises, request shows Settled.

- [ ] **Step 5: Commit**

```bash
git add web/src
git commit -m "feat: add transfer panel and compliance console with redemption review"
```

---

### Task 12: Sandbox adapter decision, E2E, demo video, submission

**Files:**
- Create: `README.md`, possibly `contracts/src/SandboxAPassAdapter.sol` (only if sandbox docs allow)
- Modify: spec open-questions get answered inline in `README.md`

**Interfaces:**
- Consumes: everything.
- Produces: the hackathon submission.

- [ ] **Step 1: Resolve the spec's four open questions** against the Cleanverse sandbox docs (API keys should have arrived; if not, chase in the hackathon Telegram). For each: (1) CVA-issued stMON possible? If yes and it fits in remaining time, integrate; otherwise document as "target integration" in README. (2) Attestation mechanism â†’ build `SandboxAPassAdapter` implementing `ICleanverseIdentity` only if the sandbox exposes an on-chain-readable attestation; otherwise document the adapter as the integration path. (3) CCP third-party calls â†’ same treatment. (4) Travel Rule path â†’ rename "audit attribution" to Travel Rule reporting ONLY if confirmed. Record each answer in README under "Cleanverse integration status" â€” honest claims are a scoring asset (spec: Claims discipline).

- [ ] **Step 2: Full E2E on Monad testnet** â€” run the complete demo arc from the spec (all 7 beats) with two browser profiles/wallets, fixing anything that breaks. Every beat must work twice in a row before recording.

- [ ] **Step 3: Write `README.md`** covering: one-liner, the whitespace argument (permissioned staking: named track theme, unoccupied), architecture diagram (mermaid), contract addresses, Cleanverse integration status (from Step 1), claims-discipline note, run instructions (`forge test`, deploy, `npm run dev`), and the demo script.

- [ ] **Step 4: Record the 3-minute demo video** following the spec's demo arc: verify â†’ stake â†’ drip ("simulated testnet rewards" visible) â†’ transfer pass â†’ transfer blocked â†’ revoke â†’ freeze â†’ requestRedemption â†’ officer approve/settle â†’ "compliance without confiscation" â†’ audit events on explorer. Keep the error messages on screen when transfers are blocked â€” that's the product.

- [ ] **Step 5: Submit** on the hackathon portal before 2026-08-09: project name Continuum, DeFi track, video link, repo link, description reusing the README one-liner and whitespace argument, written with correct Cleanverse vocabulary (A-Pass, A-Token, CCP) and receipt framing.

- [ ] **Step 6: Final commit**

```bash
git add README.md contracts web
git commit -m "docs: add README, integration status, and submission materials"
```


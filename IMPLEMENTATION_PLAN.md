# Web3 VPN Implementation Plan

## 1. Product Vision
**"A Web3 VPN desktop app where users pay per minute/MB using x402 tokens — no subscription, no account, no KYC."**

### Key Differentiators
- **Pay-as-you-go:** No monthly subscriptions. Pay only for the minutes or data used.
- **Privacy-First:** No email, no account, traffic is off-chain. Wallet address is the only identity.
- **Decentralized:** Incentivized node network (later stages), minimizing trust.

---

## 2. Architecture Overview
The system consists of three distinct components:

1.  **Desktop Client (The User Interface)**
    -   **Tech:** Electron + React + ethers.js
    -   **Role:** Connects wallet, manages x402 balance, finds servers, toggles VPN connection, displays real-time cost.
    -   **OS Interaction:** Spawns/controls the local WireGuard binary.

2.  **VPN Node (The Utility)**
    -   **Tech:** WireGuard Server + Node Agent (Node.js/Go/Python)
    -   **Role:** Routes traffic (off-chain), measures usage duration/bandwidth, communicates with smart contract to settle usage.
    -   **Agent Logic:** Authenticates user (via signature), tracks session start/end, triggers blockchain settlement.

3.  **Smart Contracts (The Ledger)**
    -   **Tech:** Solidity (EVM)
    -   **Role:** Holds user deposits, locks funds during sessions, settles payments from User to Node based on reported usage.

---

## 3. Detailed Data Flow

### A. Setup
1.  **User** allows `x402` token spend.
2.  **User** deposits `x402` into the `VPNPayment` contract (Prepaid Balance).

### B. Connection Start
1.  **Client** picks a node (Service Level: price/min, region).
2.  **Client** signs a `connect_request` message off-chain.
3.  **Client** sends request to **VPN Node Agent** via HTTP/WebSocket.
4.  **Node Agent** verifies balance on-chain.
5.  **Node Agent** configures WireGuard to allow User's public key.
6.  **Node Agent** calls `startSession()` on-chain (optional, or keeps state local until settlement to save gas). *Optimized approach: Local state first, settlement later.*

### C. Active Session
1.  **WireGuard** tunnels traffic (pure UDP, high speed).
2.  **Node Agent** tracks time connected.
3.  **Client** shows a running timer and estimated cost.

### D. Settlement & Disconnect
1.  **Periodic Checks:** Every X minutes, Node Agent can trigger a partial settlement or check balance solvency.
2.  **Disconnect:** User clicks "Disconnect".
3.  **Client** sends `disconnect_request` to Node.
4.  **Node Agent** removes WireGuard peer.
5.  **Node Agent** calls `settle(sessionId, duration)` on Smart Contract.
6.  **Smart Contract** transfers `x402` from User Balance to Node Balance.

---

## 4. Technology Stack Recommendation

### Frontend / Client
-   **Framework:** Electron (with React/Vite)
-   **Styling:** TailwindCSS (for modern, "Web3" aesthetic)
-   **Web3:** ethers.js or viem + wagmi (if React heavy)
-   **VPN Core:** Bundled `wireguard-go` or system `wireguard-tools`.

### VPN Node
-   **Server:** Linux (Ubuntu recommended)
-   **VPN Protocol:** WireGuard
-   **Agent:** Node.js (easiest integration with web3.js/ethers.js)
-   **Database:** Redis or SQLite (for ephemeral session tracking)

### Blockchain
-   **Contract:** Solidity (OpenZeppelin for security)
-   **Token:** ERC-20 (`x402`)
-   **Network:** Low-gas chain recommended (Base, Polygon, or Arbitrum) due to settlement frequency.

---

## 5. Implementation Roadmap

### Phase 1: The Hacker MVP (2-3 Weeks)
*Goal: One user, one hardcoded server, manual connect.*
1.  **Smart Contract:**
    -   `deposit()`, `withdraw()`
    -   `settleSession(user, amount)` (Owner only for now or basic signage)
2.  **VPN Server:**
    -   Manual setup of WireGuard.
    -   Simple script to listen for a ping and track time.
3.  **Client (Electron):**
    -   Metamask/Wallet connect.
    -   "Connect" button that triggers the WireGuard tunnel (using local config).

### Phase 2: The Beta (Automatic Settlement)
*Goal: Real pay-as-you-go logic.*
1.  **Agent Improvement:** Automate the "User connects -> Agent starts timer -> Agent calls contract" loop.
2.  **UI Polish:** Live cost ticker, balance warnings.

### Phase 3: The Market (Scale)
*Goal: Anyone can run a node.*
1.  **Registry Contract:** Nodes register IP + Price.
2.  **Discovery:** Client fetches list of nodes from contract/indexer.
3.  **Staking:** Nodes stake x402 to prove good behavior.

---

## 6. Development Checklist (Next Steps)

- [ ] **Token Decision:** Are we deploying a new `x402` test token or using an existing stablecoin (USDC) for the MVP?
- [ ] **Chain Selection:** Choose a testnet (Sepolia/Base Sepolia) for development.
- [ ] **Repo Setup:** Initialize Electron project and Hardhat project.

const { ethers } = require('ethers');
const { CONTRACTS, FAUCET_PRIVATE_KEY } = require('./constants.js');

// DOM Elements
const addressEl = document.getElementById('walletAddress');
const balanceEl = document.getElementById('walletBalance');
const statusEl = document.getElementById('statusText');
const connectBtn = document.getElementById('connectBtn');
const faucetBtn = document.getElementById('faucetBtn');

// Storage Key
const WALLET_KEY = 'x402_burner_wallet_pk';
const RPC_URL = 'http://127.0.0.1:8545'; // Localhost for Dev

let myWallet;
let myProvider;
let x402Contract;

async function initWallet() {
    // 1. Try to load existing key
    const storedKey = localStorage.getItem(WALLET_KEY);

    if (storedKey) {
        myWallet = new ethers.Wallet(storedKey);
    } else {
        // 2. Create new random wallet if none exists
        myWallet = ethers.Wallet.createRandom();
        localStorage.setItem(WALLET_KEY, myWallet.privateKey);
    }

    // 3. Display Address
    addressEl.innerText = myWallet.address;

    // 4. Connect to Blockchain
    try {
        myProvider = new ethers.JsonRpcProvider(RPC_URL);
        // Bind wallet to provider
        const signer = myWallet.connect(myProvider);

        // Initialize Token Contract
        x402Contract = new ethers.Contract(CONTRACTS.x402.address, CONTRACTS.x402.abi, signer);

        // 5. Check Balances
        updateBalances();
    } catch (e) {
        console.error("Connection Error:", e);
        statusEl.innerText = "Error: Is Hardhat node running?";
    }
}

async function updateBalances() {
    if (!myProvider || !myWallet) return;

    try {
        // A. Native ETH (Gas)
        const ethBalance = await myProvider.getBalance(myWallet.address);
        const ethFmt = parseFloat(ethers.formatEther(ethBalance)).toFixed(4);

        // B. x402 Tokens (VPN Credit)
        // We handle the case where contract might not exist yet
        let tokenFmt = "0.00";
        try {
            const tokenBalance = await x402Contract.balanceOf(myWallet.address);
            tokenFmt = parseFloat(ethers.formatUnits(tokenBalance, 18)).toFixed(2);
        } catch (e) {
            console.warn("x402 read failed (maybe not deployed?)", e);
        }

        // Display nicely
        balanceEl.innerHTML = `
            ${tokenFmt} <span class="currency">x402</span><br>
            <span style="font-size: 0.4em; color: #555;">(Gas: ${ethFmt} ETH)</span>
        `;

    } catch (err) {
        console.error("Balance check failed:", err);
    }
}

// --- Faucet Logic (Dev Only) ---
faucetBtn.addEventListener('click', async () => {
    if (!myProvider) return alert("Not connected to node!");

    const originalText = faucetBtn.innerText;
    faucetBtn.innerText = "⏳ Funding...";
    faucetBtn.disabled = true;

    try {
        // 1. Create the God Wallet (Account #0)
        const godWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, myProvider);

        // Fetch the correct nonce from the network manually
        let currentNonce = await myProvider.getTransactionCount(godWallet.address, "latest");

        // 2. Send 1.0 ETH for Gas
        const tx1 = await godWallet.sendTransaction({
            to: myWallet.address,
            value: ethers.parseEther("1.0"),
            nonce: currentNonce
        });
        await tx1.wait();
        console.log("ETH Sent!");

        // 3. Send 1000 x402 Tokens
        // We use nonce + 1 for the second transaction
        const godTokenContract = new ethers.Contract(CONTRACTS.x402.address, CONTRACTS.x402.abi, godWallet);
        const tx2 = await godTokenContract.transfer(myWallet.address, ethers.parseUnits("1000", 18), { nonce: currentNonce + 1 });
        await tx2.wait();
        console.log("Tokens Sent!");

        alert("Success! You received 1.0 ETH and 1000 x402.");
        updateBalances();

    } catch (err) {
        console.error(err);
        alert("Faucet Failed: " + err.message);
    } finally {
        faucetBtn.innerText = originalText;
        faucetBtn.disabled = false;
    }
});

// Button Logic
connectBtn.addEventListener('click', () => {
    alert("This will start WireGuard in the next step!");
});

// Run on startup
initWallet();

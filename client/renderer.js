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
const RPC_URL = 'http://127.0.0.1:8545';

let myWallet;
let myProvider;
let x402Contract;
let vpnContract;
let isVpnConnected = false;
let sessionTimer = null;

async function initWallet() {
    // 1. Load User
    const storedKey = localStorage.getItem(WALLET_KEY);
    if (storedKey) {
        myWallet = new ethers.Wallet(storedKey);
    } else {
        myWallet = ethers.Wallet.createRandom();
        localStorage.setItem(WALLET_KEY, myWallet.privateKey);
    }

    addressEl.innerText = myWallet.address;

    // 2. Connect to Blockchain
    try {
        myProvider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = myWallet.connect(myProvider);

        x402Contract = new ethers.Contract(CONTRACTS.x402.address, CONTRACTS.x402.abi, signer);
        vpnContract = new ethers.Contract(CONTRACTS.vpnPayment.address, CONTRACTS.vpnPayment.abi, signer);

        updateBalances();
    } catch (e) {
        console.error(e);
        statusEl.innerText = "Error: Node not running?";
    }
}

async function updateBalances() {
    if (!myProvider) return;
    try {
        // Native ETH
        const ethBalance = await myProvider.getBalance(myWallet.address);
        const ethFmt = parseFloat(ethers.formatEther(ethBalance)).toFixed(4);

        // X402 Token
        const tokenBalance = await x402Contract.balanceOf(myWallet.address);
        const tokenFmt = parseFloat(ethers.formatUnits(tokenBalance, 18)).toFixed(2);

        // VPN Prepaid Deposit
        const deposited = await vpnContract.balances(myWallet.address);
        const depositFmt = parseFloat(ethers.formatUnits(deposited, 18)).toFixed(2);

        balanceEl.innerHTML = `
            ${tokenFmt} <span class="currency">x402 (Wallet)</span><br>
            <span style="font-size: 0.6em; color: #00cc6a;">${depositFmt} x402 (Prepaid)</span><br>
            <span style="font-size: 0.4em; color: #555;">(Gas: ${ethFmt} ETH)</span>
        `;
    } catch (e) { console.warn(e); }
}

// --- Faucet Logic ---
faucetBtn.addEventListener('click', async () => {
    if (!myProvider) return;
    faucetBtn.innerText = "⏳ Funding...";
    faucetBtn.disabled = true;

    try {
        const godWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, myProvider);
        let nonce = await myProvider.getTransactionCount(godWallet.address, "latest");

        // Send ETH
        const tx1 = await godWallet.sendTransaction({
            to: myWallet.address,
            value: ethers.parseEther("1.0"),
            nonce: nonce
        });
        await tx1.wait();

        // Send Tokens
        const godToken = new ethers.Contract(CONTRACTS.x402.address, CONTRACTS.x402.abi, godWallet);
        const tx2 = await godToken.transfer(myWallet.address, ethers.parseUnits("1000", 18), { nonce: nonce + 1 });
        await tx2.wait();

        alert("Calculated! Money Sent.");
        updateBalances();
    } catch (e) { alert(e.message); }
    finally {
        faucetBtn.innerText = "💰 Get Free Test Tokens (Dev Only)";
        faucetBtn.disabled = false;
    }
});

// --- Connect Logic (The Real Deal) ---
connectBtn.addEventListener('click', async () => {
    if (isVpnConnected) {
        // DISCONNECT
        clearInterval(sessionTimer);
        statusEl.innerText = "Disconnected";
        statusEl.style.color = "red";
        connectBtn.innerText = "Connect VPN";
        connectBtn.style.background = "#00ff88";
        connectBtn.style.color = "black";
        isVpnConnected = false;
        return;
    }

    // CONNECT
    try {
        connectBtn.disabled = true;

        // 1. Check Prepaid Balance
        const deposited = await vpnContract.balances(myWallet.address);

        // If less than 100 x402, force a deposit
        if (deposited < ethers.parseUnits("1", 18)) {
            const amount = ethers.parseUnits("100", 18);

            statusEl.innerText = "Approving x402...";

            // Get current nonce to prevent collision
            let currentNonce = await myProvider.getTransactionCount(myWallet.address, "latest");

            const txApprove = await x402Contract.approve(CONTRACTS.vpnPayment.address, amount, { nonce: currentNonce });
            await txApprove.wait();

            statusEl.innerText = "Depositing to VPN Bank...";
            const txDeposit = await vpnContract.deposit(amount, { nonce: currentNonce + 1 });
            await txDeposit.wait();

            await updateBalances();
        }

        // 2. Simulate WireGuard Connection
        statusEl.innerText = "Handshaking...";
        await new Promise(r => setTimeout(r, 1000)); // Fake network delay

        // 3. Success State
        isVpnConnected = true;
        statusEl.innerText = "CONNECTED (Secured)";
        statusEl.style.color = "#00ff88";

        connectBtn.innerText = "Disconnect";
        connectBtn.style.background = "#ff4444";
        connectBtn.style.color = "white";

        // Start "Cost" simulation
        let seconds = 0;
        sessionTimer = setInterval(() => {
            seconds++;
            const cost = (seconds * 0.1).toFixed(2);
            statusEl.innerText = `CONNECTED | Time: ${seconds}s | Cost: ${cost} x402`;
        }, 1000);

    } catch (e) {
        console.error(e);
        alert("Connection Failed: " + e.code);
        statusEl.innerText = "Disconnected";
    } finally {
        connectBtn.disabled = false;
    }
});

initWallet();

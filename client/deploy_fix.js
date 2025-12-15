const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Starting Emergency Deployment...");

    // 1. Connect to Localhost
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

    // Use the 1st account (God account)
    // We can't access generic accounts easily without private key in ethers unless we use JsonRpcSigner
    // But hardhat node exposes accounts. Let's use the known private key of Account #0
    const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Using Account: ${wallet.address}`);

    // 2. Read Artifacts
    const x402Path = path.resolve(__dirname, '../contracts/artifacts/contracts/X402.sol/X402.json');
    const vpnPath = path.resolve(__dirname, '../contracts/artifacts/contracts/VPNPayment.sol/VPNPayment.json');

    const x402Artifact = JSON.parse(fs.readFileSync(x402Path, 'utf8'));
    const vpnArtifact = JSON.parse(fs.readFileSync(vpnPath, 'utf8'));

    // 3. Deploy X402
    console.log("Deploying X402 Token...");
    const X402Factory = new ethers.ContractFactory(x402Artifact.abi, x402Artifact.bytecode, wallet);
    const x402 = await X402Factory.deploy();
    await x402.waitForDeployment();
    const x402Address = await x402.getAddress();
    console.log(`✅ X402 Deployed at: ${x402Address}`);

    // 4. Deploy VPNPayment
    console.log("Deploying VPNPayment...");
    const VPNFactory = new ethers.ContractFactory(vpnArtifact.abi, vpnArtifact.bytecode, wallet);
    const vpn = await VPNFactory.deploy(x402Address);
    await vpn.waitForDeployment();
    const vpnAddress = await vpn.getAddress();
    console.log(`✅ VPNPayment Deployed at: ${vpnAddress}`);

    // 5. Update constants.js
    const constantsPath = path.resolve(__dirname, 'constants.js');
    let content = fs.readFileSync(constantsPath, 'utf8');

    // Regex replace the addresses
    // We assume the file format hasn't changed drastically
    content = content.replace(/address:\s*"0x[a-fA-F0-9]+"/, `address: "${x402Address}"`); // First match is X402
    // The second match is trickier, let's capture the file content more robustly or just replace the second occurrence
    // Actually, let's just rewrite the file safely using the known structure if possible, or use replace with context

    // Safer regex: look for x402 block
    content = content.replace(/x402:\s*{[\s\S]*?address:\s*"(0x[a-fA-F0-9]+)"/, (match, p1) => {
        return match.replace(p1, x402Address);
    });

    // Look for vpnPayment block
    content = content.replace(/vpnPayment:\s*{[\s\S]*?address:\s*"(0x[a-fA-F0-9]+)"/, (match, p1) => {
        return match.replace(p1, vpnAddress);
    });

    fs.writeFileSync(constantsPath, content);
    console.log("✅ constants.js updated automatically!");
}

main().catch(console.error);

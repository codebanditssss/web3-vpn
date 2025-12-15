import hre from "hardhat";

async function main() {
    console.log("🚀 Starting deployment (Generic Edition)...");

    // 1. Deploy the Token
    // 'viem' is injected into 'hre' at runtime, so we access it from there
    const x402 = await hre.viem.deployContract("X402");
    console.log(`✅ x402 Token deployed to: ${x402.address}`);

    // 2. Deploy the Payment Contract
    const payment = await hre.viem.deployContract("VPNPayment", [x402.address]);
    console.log(`✅ VPNPayment deployed to: ${payment.address}`);

    console.log("\nCopy these addresses for your App!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

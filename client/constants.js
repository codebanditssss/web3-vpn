module.exports = {
    CONTRACTS: {
        x402: {
            address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            abi: [
                "function balanceOf(address owner) view returns (uint256)",
                "function transfer(address to, uint256 value) returns (bool)",
                "function approve(address spender, uint256 value) returns (bool)"
            ]
        },
        vpnPayment: {
            address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            abi: [
                "function deposit(uint256 amount)",
                "function balances(address user) view returns (uint256)",
                "function withdraw()"
            ]
        }
    },
    // Hardhat Account #0 (The "God" account with all the money)
    FAUCET_PRIVATE_KEY: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
};

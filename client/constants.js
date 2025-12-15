module.exports = {
    CONTRACTS: {
        x402: {
            address: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
            abi: [
                "function balanceOf(address owner) view returns (uint256)",
                "function transfer(address to, uint256 value) returns (bool)",
                "function approve(address spender, uint256 value) returns (bool)"
            ]
        },
        vpnPayment: {
            address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
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

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VPNModule = buildModule("VPNModule", (m) => {
    // 1. Deploy the Token
    const x402 = m.contract("X402");

    // 2. Deploy the Payment Contract (passing the token address)
    const vpnPayment = m.contract("VPNPayment", [x402]);

    return { x402, vpnPayment };
});

export default VPNModule;

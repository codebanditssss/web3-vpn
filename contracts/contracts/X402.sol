// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract X402 is ERC20 {
    // 1. We name it "x402 Token" and symbol "X402"
    constructor() ERC20("x402 Token", "X402") {
        // 2. We mint 1,000,000 tokens to YOU (the deployer)
        // 18 decimals is standard (like cents)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

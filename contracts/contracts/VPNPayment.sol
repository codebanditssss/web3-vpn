// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VPNPayment is Ownable {
    IERC20 public x402;

    // Mapping: User Address => Balance in x402 (pre-deposited)
    mapping(address => uint256) public balances;
    
    // Mapping: Valid Node Address => Is Authorized?
    mapping(address => bool) public authorizedNodes;

    // Event log for UI updates
    event Deposited(address indexed user, uint256 amount);
    event Settled(address indexed user, address indexed node, uint256 cost, uint256 durationSec);

    constructor(address _x402Address) Ownable(msg.sender) {
        x402 = IERC20(_x402Address);
    }

    // 1. User deposits x402 into this "Bank"
    function deposit(uint256 amount) external {
        require(x402.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    // 2. Add an authorized VPN Node (Only owner can do this for MVP)
    function addNode(address node) external onlyOwner {
        authorizedNodes[node] = true;
    }

    // 3. Node claims payment for a session
    // In V1, we trust the Node's software to report time accurately.
    function settleSession(address user, uint256 cost, uint256 totalSeconds) external {
        require(authorizedNodes[msg.sender], "Not an authorized node");
        require(balances[user] >= cost, "User insufficient balance");

        // Deduct from User
        balances[user] -= cost;
        
        // Pay the Node immediately (Simple flow)
        require(x402.transfer(msg.sender, cost), "Payment transfer failed");
        
        emit Settled(user, msg.sender, cost, totalSeconds);
    }

    // 4. User can withdraw their remaining balance
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds");
        balances[msg.sender] = 0;
        require(x402.transfer(msg.sender, amount), "Withdraw transfer failed");
    }
}

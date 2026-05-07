# Arc Finance dApp 🚀

A fully functional Web3 wallet and DeFi application built on **Arc Testnet**. Every feature works on-chain — not a demo.

🔗 **Live:** https://arc-finance-dapp.netlify.app

---

## Features

### ◈ Wallet
- Real-time USDC (native) and EURC (ERC-20) balance tracking
- Full transaction history pulled directly from the blockchain
- Copy wallet address with one click

### ⇄ Send
- Send USDC and EURC to any address on Arc Testnet
- MetaMask integration with real on-chain transactions

### ⟳ Payment Streams
- Custom smart contract deployed on Arc Testnet
- Lock tokens for a recipient over a set duration (7 / 30 / 90 / 365 days)
- Recipient can withdraw earned amount anytime
- Sender can cancel and get remaining tokens back
- Supports both USDC (native) and EURC (ERC-20)

📄 Contract: `0x98c28d49ff2fc07006ffe7d434e3b28f1204d9ab`

### ⊞ Split Pay
- Split a bill between multiple people
- Generates a payment link + QR code
- Each participant opens the link, connects wallet and pays their share
- Funds go directly on-chain

### ▤ Invoice
- Create invoices for freelance work or services
- Share payment link with your client
- Client opens the link, connects wallet and pays — funds go directly to you
- Invoice history saved locally

### ⇄ Swap
- Token swap interface between USDC and EURC

---

## Tech Stack

| | |
|---|---|
| Frontend | Next.js 14, TypeScript |
| Blockchain | ethers.js v6 |
| Smart Contracts | Solidity, Hardhat |
| Wallet | MetaMask |
| Network | Arc Testnet |
| Deploy | Netlify |

---

## Smart Contract

Custom `PaymentStream` contract written from scratch:
- Supports native USDC (sent via `msg.value`)
- Supports ERC-20 EURC (via `approve` + `transferFrom`)
- Linear vesting — recipient earns tokens per second
- Cancel with automatic refund split

---

## Getting Started

```bash
git clone https://github.com/yoncazenan/-arc-wallet-dapp.git
cd -arc-wallet-dapp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Network Config

Add Arc Testnet to MetaMask:

| | |
|---|---|
| Network Name | Arc Testnet |
| RPC URL | https://arc-testnet.drpc.org |
| Chain ID | 5042002 |
| Symbol | USDC |
| Explorer | https://testnet.arcscan.app |

---

## License

MIT
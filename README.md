# 🗳️ LivePoll - Decentralized Voting on Stellar

[![Next.js 16](https://img.shields.io/badge/Next.js-16--Canary-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Soroban](https://img.shields.io/badge/Soroban-Rust-orange?logo=rust)](https://soroban.stellar.org/)
[![MongoDB Sync](https://img.shields.io/badge/MongoDB-Global--Sync-47A248?logo=mongodb)](https://www.mongodb.com/)

![LivePoll Hero Dashboard](./public/images/hero.png)

A professional, production-ready decentralized Live Poll application built for the **Antigravity x Stellar Yellow Belt** competition. Experience high-fidelity glassmorphism UI paired with real-time on-chain event polling and global simulation synchronization.

---

## 🚀 Key Features

- **Dual-Path Architecture**: 
  - **On-Chain Mode (Soroban)**: Uses the Stellar network as the single source of truth for vote finality.
  - **Global Simulation Mode (MongoDB)**: Powered by a dedicated backend to allow cross-device, real-time synchronization before your contract is live.
- **Multi-Wallet Support**: Integrated `StellarWalletsKit v2` supporting Freighter, LOBSTR, xBull, Rabet, and Albedo.
- **Admin Console**: Dedicated dashboard for contract owners to initialize and configure polls directly from the dApp with global reset capabilities.

![Admin Console Mockup](./public/images/admin.png)
- **Real-Time Dashboards**: Automated polling for Horizon events (and MongoDB simulation) with state-of-the-art animated progress bars.
- **Robust Security**: Pre-flight balance checks (1.5 XLM minimum) and global address de-duplication to prevent double-voting.
- **Premium Aesthetics**: Dark mode "Deep Space" theme built on **Tailwind CSS v4** with advanced `@theme` variables, glassmorphism, and Framer Motion choreographies.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) with Turbopack.
- **Styling**: Tailwind CSS v4 + `lucide-react`.
- **Blockchain**: Stellar SDK + Soroban Smart Contracts.
- **Database**: MongoDB (Mongoose) for global simulation persistence.
- **Animations**: Framer Motion 12.

---

## 📦 Getting Started

### 1. Prerequisites
- [Stellar CLI](https://stellar.org/docs/install-stellar-cli)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Account](https://www.mongodb.com/cloud/atlas) (for Simulation Mode)

### 2. Installation
```bash
git clone [YOUR_REPO_URL]
cd livepoll
npm install
```

### 3. Setup Environment
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
```

### 4. Setup Contract
Update `src/lib/constants.ts` with your deployed Contract ID. If this is missing or invalid, the app will gracefully activate **Global Simulation Mode** via MongoDB.

---

## 📜 Smart Contract Deployment

1. **Build the contract**:
   ```bash
   cd contract
   cargo build --target wasm32-unknown-unknown --release
   ```

2. **Deploy**:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/live_poll.wasm \
     --source [YOUR_IDENTITY] \
     --network testnet
   ```

3. **Initialize**: Use the **Admin Console** at the footer of the dApp to initialize your poll.

---

## 🏆 Competition Context
Submitted for the **Antigravity x Stellar Yellow Belt** competition. 
Focused on delivering UI/UX excellence, robust blockchain integration, and a future-proof tech stack.

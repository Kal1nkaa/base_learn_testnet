# 🏗️ Base Smart Contracts Learning Hub

[![Base](https://img.shields.io/badge/Base-Mainnet-blue)](https://base.org)
[![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-green)](https://sepolia.base.org)
[![WalletConnect](https://img.shields.io/badge/WalletConnect-Integrated-orange)](https://walletconnect.com)
[![Reown AppKit](https://img.shields.io/badge/Reown-AppKit-purple)](https://reown.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Foundry](https://img.shields.io/badge/Foundry-Framework-red)](https://getfoundry.sh)

> **Learn smart contract development through hands-on interaction with 15+ deployed contracts on Base blockchain**

## 📖 What is This?

This is an interactive learning platform designed to teach smart contract development through practical examples. Built on **Base** (Coinbase's Layer 2 network), it features a comprehensive collection of smart contracts that demonstrate everything from basic arithmetic to complex NFT systems and governance mechanisms.

**Perfect for:**
- Blockchain developers learning Solidity
- Students exploring Web3 development  
- Anyone curious about smart contract functionality
- Developers wanting to understand Base ecosystem

## ✨ Key Features

### 🔗 **Live Contract Interaction**
- Connect your wallet and interact with real deployed contracts
- See your transactions on BaseScan in real-time
- Learn by doing, not just reading

### 🎓 **Educational Smart Contracts**
- **15+ unique contracts** covering different concepts
- From beginner (BasicMath) to advanced (WeightedVoting)
- Well-commented code for easy understanding

### 🌐 **Modern Web3 Stack**
- **Base blockchain** - Fast, cheap, Ethereum-compatible
- **Reown AppKit** - Connect 300+ wallets seamlessly  
- **Next.js frontend** - Modern, responsive interface
- **Foundry** - Professional smart contract development tools

## 📚 Smart Contract Library

Our learning platform includes **15 carefully crafted smart contracts**, each designed to teach specific Solidity concepts:

### 🟢 **Beginner Level**
- **BasicMath** - Learn safe arithmetic operations and function basics
- **ControlStructures** - Master if/else statements, loops, and conditionals  
- **ArraysExercise** - Work with arrays, mappings, and data structures

### 🟡 **Intermediate Level**
- **EmployeeStorage** - Understand structs, storage patterns, and data management
- **UnburnableToken** - Build your first ERC20 token with custom features
- **AddressBookFactory** - Learn factory patterns and contract deployment
- **FavoriteRecords** - Explore mappings and user data management

### 🔴 **Advanced Level**
- **HaikuNFT** - Create ERC721 NFTs with metadata and minting
- **WeightedVoting** - Build DAO governance with voting mechanisms
- **GarageManager** - Complex state management and business logic
- **ErrorTriageExercise** - Master error handling and debugging
- **InheritanceSubmission** - Learn contract inheritance and polymorphism

### 💼 **Real-World Examples**
- **Salesperson & EngineeringManager** - Professional contract patterns
- **ImportsExercise** - Organize code with imports and libraries

> 🚀 **All contracts are deployed on both Base Mainnet and Base Sepolia** for testing and production use

## 🚀 Get Started in 5 Minutes

### Prerequisites

You'll need:
- **Node.js 18+** installed on your computer
- **A crypto wallet** (MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet)
- **Small amount of ETH** on Base network for transaction fees (very cheap!)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/base-smart-contracts.git
cd base-smart-contracts
npm install
```

### Step 2: Configure Environment

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local and add your project ID
NEXT_PUBLIC_PROJECT_ID="your_walletconnect_project_id"
```

> 💡 **Get your Project ID**: Visit [WalletConnect Cloud](https://cloud.walletconnect.com) to create a free project

### Step 3: Launch the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Connect & Explore

1. **Connect your wallet** using the connect button
2. **Switch to Base network** when prompted (your wallet will help with this)
3. **Start learning!** Click on any contract card to interact with it

> 🎉 **That's it!** You're now ready to explore smart contracts on Base blockchain.

## 🔧 For Developers

### Technology Stack

Our platform is built with modern Web3 technologies:

- **🏗️ Smart Contracts**: Solidity + Foundry for development and testing
- **🌐 Blockchain**: Base (Ethereum L2) for fast, cheap transactions  
- **⚛️ Frontend**: Next.js 14 with TypeScript for type safety
- **🔗 Wallet Connection**: Reown AppKit (WalletConnect v2) for universal wallet support
- **🎨 Styling**: Tailwind CSS for responsive design
- **🔄 State Management**: Wagmi + TanStack Query for Web3 state

### Project Structure

```
krutas_contracts/
├── app/                    # Next.js app directory
│   ├── components/         # React components for each contract
│   ├── api/               # API routes for contract interactions
│   └── page.tsx           # Main application page
├── contracts/             # Foundry smart contract project
│   ├── src/               # Solidity source files
│   ├── test/              # Contract tests
│   └── script/            # Deployment scripts
├── config/                # WalletConnect configuration
├── context/               # React context providers
└── scripts/               # Node.js interaction scripts
```

### Smart Contract Development

Want to deploy your own contracts? Here's how:

```bash
# Navigate to contracts directory
cd contracts

# Compile contracts
forge build

# Run tests
forge test

# Deploy to Base Sepolia (testnet)
forge script script/YourContract.s.sol --rpc-url base_sepolia --broadcast

# Deploy to Base Mainnet (production)
forge script script/YourContract.s.sol --rpc-url base --broadcast --verify
```

### Testing & Interaction

We provide Node.js scripts for testing contract interactions:

```bash
# Test individual contracts
node scripts/test_basicmath.js
node scripts/unburnable_token_interaction.js
node scripts/haiku_nft_interaction.js

# Run all contract tests
node scripts/interact_with_contracts.js
```

## 🎓 Learning Path

### New to Smart Contracts?

1. **Start with BasicMath** - Learn function calls and basic Solidity syntax
2. **Try ControlStructures** - Understand conditional logic and loops
3. **Explore ArraysExercise** - Work with data structures
4. **Build EmployeeStorage** - Learn about structs and mappings

### Ready for More?

5. **Create UnburnableToken** - Your first ERC20 token
6. **Mint HaikuNFT** - Explore NFTs and metadata
7. **Vote with WeightedVoting** - Understand governance mechanisms
8. **Manage GarageManager** - Complex state management

### Advanced Concepts

9. **Debug ErrorTriageExercise** - Master error handling
10. **Inherit with InheritanceSubmission** - Learn contract inheritance
11. **Organize with ImportsExercise** - Code organization patterns

## 🌍 Why Base Blockchain?

**Base** is Coinbase's Ethereum Layer 2 network designed to bring the next billion users onchain. Here's why we chose it for this learning platform:

### 💰 **Extremely Low Costs**
- Transaction fees typically under $0.01
- Perfect for learning without breaking the bank
- Makes experimenting with contracts affordable

### ⚡ **Lightning Fast**
- Transactions confirm in 1-2 seconds
- No waiting around to see results
- Instant feedback for learning

### 🔗 **Ethereum Compatible**
- Same tools, same code, same wallets
- Everything you learn applies to Ethereum mainnet
- Seamless developer experience

### 🛡️ **Secure & Reliable**
- Backed by Coinbase infrastructure
- Battle-tested security model
- Decentralized and open-source

### 🎯 **Beginner Friendly**
- Easy onramp from fiat to crypto
- Integrated with Coinbase ecosystem
- Great first blockchain experience

## 📋 Deployment Addresses

### 🔵 Base Mainnet (Chain ID: 8453)

```
BasicMath:           0x5ce7b3d39c2e89d04d9d24b1b37598f9ac50ce71
ControlStructures:   0x9c9844918f610e8dd275d7d616ac942da5fe1ebf
EmployeeStorage:     0x50974760e8eba50a68c2779d91e744187466c042
ArraysExercise:      0x27f45d703ed0da3a8788f469aa4cddc45fc33dd6
ErrorTriageExercise: 0xd483ceb1f75752eccec25822c4917f0be3f9f810
AddressBookFactory:  0x7bb4ba6a6c4f6281ede53b42c46c6e9a9bf4bf50
UnburnableToken:     0xb1fa62e4a5485f475ccc800249ff0ac06ea5115d
WeightedVoting:      0x27a4d546c317735d06a9e04bcf6dc4f8ef4c8454
HaikuNFT:            0xd614b6bccd2d1432929b0726b41a84dd22f80cab
FavoriteRecords:     0x91dd217fd6c11a112db1411649d8d893bd7f912f
GarageManager:       0x1550b93c82eb6e28d871e5432ace6b70b87fd997
Salesperson:         0xbaa17b24489f9baf52b3d9132ccffaa5c30ab306
EngineeringManager:  0xf9800621c40ab04d712ad31f8e88544889cf59d8
InheritanceSubmission: 0xdde65303e47e5fba7cacba03e88d0ef436295e80
ImportsExercise:     0xaface816acb1c1cecbd335407bf1e81625310572
```

### 🟢 Base Sepolia (Chain ID: 84532)

```
BasicMath:           0x509A5892aFCFAe5872aa13602A89B5B1d33106c3
ControlStructures:   0x4D0A0cA1aa0e07804F31588A1db4E5B3619f4029
EmployeeStorage:     0x9c26fbaa985D26a61eF6bf87cE460e3b48629a81
ArraysExercise:      0xEfe49D84e1D3D55461ADfe408963E13687C26D2C
ErrorTriageExercise: 0x6Cf63EdaBeDed0F35f8FF365406F6B0750544d87
AddressBookFactory:  0xB2625009B5495CA33637d0eAa18bd22F9F170bc0
UnburnableToken:     0x91251829756B1608F09D3757467Fab693EDc6822
WeightedVoting:      0xA5677ef95aA4e04A0A01EC2b8127Cc15F1D942D0
HaikuNFT:            0x31ed45095850360225f162fEff06f8164e207a14
FavoriteRecords:     0x8d865d691026A57eBe57dC9E45550AE176361077
GarageManager:       0x0CB7F5501aa38Df1E50C27d10E4E2691cD95Ca60
Salesperson:         0xc7B2c067F0729aAE803B2fDE2dA87bdB7760f99f
EngineeringManager:  0xDA7bd840dfd540a0bAB7dC4d4d93D6C1c841ED3c
InheritanceSubmission: 0xFEBb1d6031E1cA6De10d2235959fe6bF0dc40BE4
ImportsExercise:     0x79193ae42708F74D3Ba96047dd2b04B328C66Ade
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding new contracts, or improving documentation, your help makes this platform better for everyone.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-improvement`
3. **Test thoroughly** on Base Sepolia testnet first
4. **Submit a pull request** with a clear description

### Contribution Ideas

- 🆕 **New Smart Contracts**: Add educational contracts with different concepts
- 🐛 **Bug Fixes**: Fix issues in existing contracts or frontend
- 📚 **Documentation**: Improve explanations, add tutorials, or translate content
- 🎨 **UI/UX Improvements**: Enhance the learning experience
- 🧪 **Testing**: Add more comprehensive tests

### Guidelines

- Always test on Base Sepolia before proposing mainnet changes
- Follow existing code style and patterns
- Include clear comments in smart contracts
- Update documentation for any new features

## 📚 Additional Resources

### 🔵 Base Blockchain
- [Base Official Website](https://base.org) - Learn about Base ecosystem
- [Base Documentation](https://docs.base.org) - Technical documentation  
- [BaseScan Block Explorer](https://basescan.org) - Explore transactions and contracts
- [Base Bridge](https://bridge.base.org) - Bridge assets to Base
- [Base Faucet](https://faucet.quicknode.com/base/sepolia) - Get testnet ETH

### 🔗 Web3 Development
- [Foundry Documentation](https://book.getfoundry.sh) - Smart contract development
- [Solidity Documentation](https://docs.soliditylang.org) - Learn Solidity programming
- [Reown AppKit](https://docs.reown.com/appkit) - Wallet connection library
- [Wagmi Documentation](https://wagmi.sh) - React hooks for Ethereum
- [OpenZeppelin](https://docs.openzeppelin.com) - Secure smart contract library

### 🎓 Learning Materials
- [CryptoZombies](https://cryptozombies.io) - Interactive Solidity tutorial
- [Ethereum.org Developer Resources](https://ethereum.org/en/developers) - Comprehensive guides
- [Alchemy University](https://university.alchemy.com) - Free blockchain courses
- [Base Learn](https://base.org/learn) - Base-specific tutorials

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Special thanks to:
- **Base Team** for building an amazing L2 platform
- **Coinbase** for making blockchain accessible
- **Reown/WalletConnect** for seamless wallet integration  
- **Foundry Team** for excellent development tools
- **OpenZeppelin** for secure contract standards

---

<div align="center">

**🚀 Built with ❤️ on Base Blockchain**

*Start your Web3 journey today - connect your wallet and begin learning!*

</div>

import WalletConnection from './components/WalletConnection'
import BasicMathCard from './components/BasicMathCard'
import ControlStructuresCard from './components/ControlStructuresCard'
import EmployeeStorageCard from './components/EmployeeStorageCard'
import ArraysExerciseCard from './components/ArraysExerciseCard'
import FavoriteRecordsCard from './components/FavoriteRecordsCard'
import GarageManagerCard from './components/GarageManagerCard'
import InheritanceCard from './components/InheritanceCard'
import ImportsExerciseCard from './components/ImportsExerciseCard'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🚀 Base Smart Contracts
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interact with deployed smart contracts on Base Sepolia testnet. 
            Connect your wallet to test BasicMath and ControlStructures functions.
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-4xl mx-auto mb-8">
          <WalletConnection />
        </div>

        {/* Contract Interaction Cards */}
        <div className="max-w-6xl mx-auto space-y-8">
          <BasicMathCard />
          <ControlStructuresCard />
          <EmployeeStorageCard />
          <ArraysExerciseCard />
          <FavoriteRecordsCard />
          <GarageManagerCard />
          <InheritanceCard />
          <ImportsExerciseCard />
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>Built with Next.js, Wagmi, and Reown AppKit on Base Sepolia</p>
        </footer>
      </main>
    </div>
  )
}
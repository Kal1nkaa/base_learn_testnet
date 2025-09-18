const { createWalletClient, createPublicClient, http, parseEther, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = 'ADRPR'
const account = privateKeyToAccount(PRIVATE_KEY)

// RPC endpoints for Base mainnet
const rpcEndpoints = [
  'https://mainnet.base.org',
  'https://base-mainnet.g.alchemy.com/v2/demo',
  'https://base.blockpi.network/v1/rpc/public',
  'https://base.drpc.org'
]

// Create clients
const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcEndpoints[0])
})

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(rpcEndpoints[0])
})

// Contract addresses
const CONTRACTS = {
  BASIC_MATH: '0x2a50A417ee05D7527787C9f5ED7657CF9DaD3BFB',
  CONTROL_STRUCTURES: '0xaB6B6c13Fd72A92D27096d779F8188F85F4bb5Be',
  IMPORTS_EXERCISE: '0x63E8c947Ff8232c4e7FF0e737468525786c64962',
  ADDRESS_BOOK_FACTORY: '0x3D2C2Ae27Aa7760adD64073717341547541E4c2e'
}

// ABIs for contract interactions
const ABIS = {
  BASIC_MATH: [
    {
      "inputs": [{"internalType": "uint256", "name": "_a", "type": "uint256"}, {"internalType": "uint256", "name": "_b", "type": "uint256"}],
      "name": "adder",
      "outputs": [{"internalType": "uint256", "name": "sum", "type": "uint256"}, {"internalType": "bool", "name": "error", "type": "bool"}],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_a", "type": "uint256"}, {"internalType": "uint256", "name": "_b", "type": "uint256"}],
      "name": "subtractor",
      "outputs": [{"internalType": "uint256", "name": "difference", "type": "uint256"}, {"internalType": "bool", "name": "error", "type": "bool"}],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  CONTROL_STRUCTURES: [
    {
      "inputs": [{"internalType": "uint256", "name": "_number", "type": "uint256"}],
      "name": "fizzBuzz",
      "outputs": [{"internalType": "string", "name": "", "type": "string"}],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  IMPORTS_EXERCISE: [
    {
      "inputs": [
        {"internalType": "string", "name": "_line1", "type": "string"},
        {"internalType": "string", "name": "_line2", "type": "string"},
        {"internalType": "string", "name": "_line3", "type": "string"}
      ],
      "name": "saveHaiku",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  ADDRESS_BOOK_FACTORY: [
    {
      "inputs": [],
      "name": "deploy",
      "outputs": [{"internalType": "address", "name": "addressBookAddress", "type": "address"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function interactWithContract(contractName, contractAddress, abi, functionName, args = []) {
  try {
    console.log(`\n🔄 Interacting with ${contractName}...`)
    console.log(`   Address: ${contractAddress}`)
    console.log(`   Function: ${functionName}`)
    console.log(`   Args: ${JSON.stringify(args)}`)
    
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
      functionName: functionName,
      args: args
    })
    
    console.log(`   ✅ Transaction hash: ${hash}`)
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`)
    
    return { success: true, hash, receipt }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function readFromContract(contractAddress, abi, functionName, args = []) {
  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Starting contract interactions on Base Mainnet...')
  console.log(`📝 Account: ${account.address}`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. BasicMath - Test both adder and subtractor functions (read-only)
  console.log('\n📊 Testing BasicMath (read-only)...')
  
  // Test adder function
  const adderResult = await readFromContract(
    CONTRACTS.BASIC_MATH,
    ABIS.BASIC_MATH,
    'adder',
    [15, 25]
  )
  if (adderResult.success) {
    console.log(`   ✅ Adder Result: ${adderResult.result}`)
    results.push({ contract: 'BasicMath (adder)', success: true, type: 'read' })
  }
  
  // Test subtractor function
  const subtractorResult = await readFromContract(
    CONTRACTS.BASIC_MATH,
    ABIS.BASIC_MATH,
    'subtractor',
    [50, 25]
  )
  if (subtractorResult.success) {
    console.log(`   ✅ Subtractor Result: ${subtractorResult.result}`)
    results.push({ contract: 'BasicMath (subtractor)', success: true, type: 'read' })
  }
  
  // 2. ControlStructures - Test FizzBuzz function (read-only)
  console.log('\n📊 Testing ControlStructures (read-only)...')
  const controlResult = await readFromContract(
    CONTRACTS.CONTROL_STRUCTURES,
    ABIS.CONTROL_STRUCTURES,
    'fizzBuzz',
    [15]
  )
  if (controlResult.success) {
    console.log(`   ✅ FizzBuzz Result: ${controlResult.result}`)
    results.push({ contract: 'ControlStructures', success: true, type: 'read' })
  }
  
  // 3. ImportsExercise - Save a haiku (write transaction)
  console.log('\n🔄 Testing ImportsExercise (write transaction)...')
  const importsResult = await interactWithContract(
    'ImportsExercise',
    CONTRACTS.IMPORTS_EXERCISE,
    ABIS.IMPORTS_EXERCISE,
    'saveHaiku',
    ['DeFi protocols flow', 'Like rivers of digital gold', 'Innovation grows']
  )
  results.push({ contract: 'ImportsExercise', ...importsResult })
  await sleep(2000)
  
  // 4. AddressBook Factory - Deploy a new address book (write transaction)
  console.log('\n🔄 Testing AddressBook Factory (write transaction)...')
  const addressBookResult = await interactWithContract(
    'AddressBook Factory',
    CONTRACTS.ADDRESS_BOOK_FACTORY,
    ABIS.ADDRESS_BOOK_FACTORY,
    'deploy',
    []
  )
  results.push({ contract: 'AddressBook Factory', ...addressBookResult })
  
  // Summary
  console.log('\n📊 INTERACTION SUMMARY:')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const type = result.type || 'write'
    console.log(`${status} ${result.contract} (${type})`)
    if (!result.success) {
      console.log(`   Error: ${result.error}`)
    } else if (result.hash) {
      console.log(`   Tx: ${result.hash}`)
    }
  })
  
  console.log(`\n🎯 Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`)
  
  if (successful === total) {
    console.log('🎉 All contract interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

// Run the script
main().catch(console.error)

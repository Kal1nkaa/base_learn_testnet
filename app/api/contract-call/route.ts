import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
})

export async function POST(request: NextRequest) {
  try {
    const { address, abi, functionName, args } = await request.json()

    const result = await publicClient.readContract({
      address,
      abi,
      functionName,
      args
    })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Contract call error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Contract call failed' 
    }, { status: 500 })
  }
}

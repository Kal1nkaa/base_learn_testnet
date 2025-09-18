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

    // Convert string arguments back to BigInt for contract calls
    const processedArgs = args.map((arg: any) => {
      if (typeof arg === 'string' && /^\d+$/.test(arg)) {
        return BigInt(arg)
      }
      return arg
    })

    const result = await publicClient.readContract({
      address,
      abi,
      functionName,
      args: processedArgs
    })

    // Convert BigInt results to strings for JSON serialization
    const processResult = (data: any): any => {
      if (typeof data === 'bigint') {
        return data.toString()
      }
      if (Array.isArray(data)) {
        return data.map(processResult)
      }
      if (data && typeof data === 'object') {
        const processed: any = {}
        for (const [key, value] of Object.entries(data)) {
          processed[key] = processResult(value)
        }
        return processed
      }
      return data
    }

    return NextResponse.json({ success: true, result: processResult(result) })
  } catch (error: any) {
    console.error('Contract call error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Contract call failed' 
    }, { status: 500 })
  }
}

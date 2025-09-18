'use client';

import { useAccount, useDisconnect } from 'wagmi';

export default function WalletConnection() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Wallet Connection</h2>
      
      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to interact with the smart contracts</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected Address:</p>
              <p className="text-lg font-mono text-gray-800 break-all">{address}</p>
            </div>
            <button
              onClick={() => disconnect()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
          
          {chain && (
            <div>
              <p className="text-sm text-gray-600">Network:</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-lg text-gray-800">{chain.name}</p>
                <span className="text-sm text-gray-500">({chain.id})</span>
              </div>
            </div>
          )}
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✅ Wallet Connected Successfully!</p>
            <p className="text-green-600 text-sm">You can now interact with the smart contracts below.</p>
          </div>
        </div>
      )}
    </div>
  );
}

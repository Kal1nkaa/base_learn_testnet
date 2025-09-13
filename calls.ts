export const counterContractAddress = '0x2dc9d7DD5512Ac982fB15A28cE5e1f90443ed7F6';
export const counterContractAbi = [
  {
    type: 'function',
    name: 'increment',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

import type { ContractFunctionParameters } from 'viem';

export const calls: ContractFunctionParameters[] = [
  {
    address: counterContractAddress,
    abi: counterContractAbi,
    functionName: 'increment',
    args: [],
  },
];



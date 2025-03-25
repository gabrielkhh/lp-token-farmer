import { useReadContract } from "wagmi"
import pancakePairAbi from "../pancake-pair-abi.json"
import { Address } from "viem"

export const useGetPancakeTokenName = (tokenAddress: Address | undefined) => {
    return useReadContract({
        address: tokenAddress,
        abi: pancakePairAbi,
        functionName: 'name',
        query: { enabled: !!tokenAddress },
    })
}

export const useGetPancakeTokenSymbol = (tokenAddress: Address | undefined) => {
    return useReadContract({
        address: tokenAddress,
        abi: pancakePairAbi,
        functionName: 'symbol',
        query: { enabled: !!tokenAddress },
    })
}

export const useGetPancakeTokenA = (tokenAddress: Address | undefined) => {
    return useReadContract({
        address: tokenAddress,
        abi: pancakePairAbi,
        functionName: 'token0',
        query: { enabled: !!tokenAddress },
    })
}

export const useGetPancakeTokenB = (tokenAddress: Address | undefined) => {
    return useReadContract({
        address: tokenAddress,
        abi: pancakePairAbi,
        functionName: 'token1',
        query: { enabled: !!tokenAddress },
    })
}
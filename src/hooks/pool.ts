import { useReadContract } from "wagmi"
import { pundixFarmContractConfig } from "../constants"
import { useGetTokenDecimals, useGetTokenName, useGetTokenSymbol } from "./token"
import { Address } from "viem"

export const useGetPoolInfo = (lpTokenAddress: Address) => {
    const { data: poolInfo } = useReadContract({
        ...pundixFarmContractConfig,
        functionName: 'poolInfo',
        args: [lpTokenAddress],
    })

    if (Array.isArray(poolInfo)) {
        return {
            pursePerBlock: poolInfo[1],
            bonusMultiplier: poolInfo[2],
            lastRewardBlock: poolInfo[3],
            accPursePerShare: poolInfo[4],
            startBlock: poolInfo[5]
        }
    } else {
        return undefined
    }
}

export const useGetPoolToken = (index: bigint) => {
    const { data: address } = useReadContract({
        ...pundixFarmContractConfig,
        functionName: 'poolTokenList',
        args: [index],
    })

    const { data: name } = useGetTokenName(address as Address | undefined)
    const { data: symbol } = useGetTokenSymbol(address as Address | undefined)
    const { data: decimals } = useGetTokenDecimals(address as Address | undefined)

    return {
        address,
        name,
        symbol,
        decimals,
    }
}

export const useGetUserPositions = (lpTokenAddress: Address, userAddress: Address | undefined) => {
    const { data: userInfo } = useReadContract({
        ...pundixFarmContractConfig,
        functionName: 'userInfo',
        args: [lpTokenAddress, userAddress],
        query: { enabled: !!userAddress },
    })

    if (Array.isArray(userInfo)) {
        return {
            amount: userInfo[0],
            rewardDebt: userInfo[1],
        }
    } else {
        return undefined
    }
}
import { useReadContract, useReadContracts } from "wagmi"
import { pundixFarmContractConfig } from "../constants"
import { useGetTokenDecimals, useGetTokenName, useGetTokenSymbol } from "./token"
import { Address, erc20Abi } from "viem"
import React from "react"
import { PoolTokenInfo } from "../types"

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

export const useGetPoolTokens = () => {
    const [poolIndices, setPoolIndices] = React.useState<bigint[]>([]);
    const [poolTokenAddresses, setPoolTokenAddresses] = React.useState<Address[]>([]);
    const [poolTokenList, setPoolTokenList] = React.useState<PoolTokenInfo[]>([]);

    // Find out the number of pools
    const { data: poolLength, isSuccess: fetchPoolLengthIsSuccess } = useReadContract({
        ...pundixFarmContractConfig,
        functionName: 'poolLength',
        args: [],
    })

    React.useEffect(() => {
        if (fetchPoolLengthIsSuccess) {
            const poolLengthCount = poolLength as bigint
            for (let i = 0n; i < poolLengthCount; i++) {
                setPoolIndices((prev) => {
                    return [...prev, i]
                })
            }
        }
    }, [poolLength, fetchPoolLengthIsSuccess])

    // Get the LP token address for each pool
    const { data: tokenList, isSuccess: fetchTokensIsSuccess } = useReadContracts({
        // @ts-ignore
        contracts: poolIndices.map((index) => ({
            ...pundixFarmContractConfig,
            functionName: 'poolTokenList',
            args: [index],
        })),
        enabled: poolIndices.length > 0,
    })

    React.useEffect(() => {
        if (fetchTokensIsSuccess) {
            for (let i = 0; i < tokenList.length; i++) {
                setPoolTokenAddresses((prev) => {
                    return [...prev, tokenList[i].result as Address]
                })
            }
        }
    }, [tokenList, fetchTokensIsSuccess])

    const { data: tokenNames, isSuccess: fetchTokenNamesIsSuccess } = useReadContracts({
        contracts: poolTokenAddresses.map((address) => ({
            address: address,
            abi: erc20Abi,
            functionName: 'name',
        })),
    })
    const { data: tokenSymbols, isSuccess: fetchTokenSymbolsIsSuccess } = useReadContracts({
        contracts: poolTokenAddresses.map((address) => ({
            address: address,
            abi: erc20Abi,
            functionName: 'symbol',
        })),
    })
    const { data: tokenDecimals, isSuccess: fetchTokenDecimalsIsSuccess } = useReadContracts({
        contracts: poolTokenAddresses.map((address) => ({
            address: address,
            abi: erc20Abi,
            functionName: 'decimals',
        })),
    })

    React.useEffect(() => {
        if (fetchTokenNamesIsSuccess && fetchTokenSymbolsIsSuccess && fetchTokenDecimalsIsSuccess) {
            for (let i = 0; i < poolTokenAddresses.length; i++) {
                setPoolTokenList((prev) => {
                    return [...prev, {
                        address: poolTokenAddresses[i],
                        name: tokenNames[i].result as string,
                        symbol: tokenSymbols[i].result as string,
                        decimals: tokenDecimals[i].result as number
                    }]
                })
            }
        }
    }, [tokenNames, tokenSymbols, tokenDecimals, poolTokenAddresses, fetchTokenNamesIsSuccess, fetchTokenSymbolsIsSuccess, fetchTokenDecimalsIsSuccess])

    return poolTokenList
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

export const useGetUserPendingRewards = (lpTokenAddress: Address, userAddress: Address | undefined) => {
    return useReadContract({
        ...pundixFarmContractConfig,
        functionName: 'pendingReward',
        args: [lpTokenAddress, userAddress],
        query: { enabled: !!userAddress },
    })
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
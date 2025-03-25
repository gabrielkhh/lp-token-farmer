import { useReadContract, useReadContracts } from "wagmi"
import { LP_FARM_CONTRACT, pundixFarmContractConfig } from "../constants"
import { useGetTokenDecimals, useGetTokenName, useGetTokenSymbol } from "./token"
import { Address } from "viem"

export const useGetPoolInfo = () => {
    return useReadContract({
        ...pundixFarmContractConfig,
        functionName: 'poolInfo',
        args: [LP_FARM_CONTRACT],
    })
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

export const useGetUserPositions = (userAddress: Address | undefined) => {
    return useReadContract({
        ...pundixFarmContractConfig,
        functionName: 'userInfo',
        args: [LP_FARM_CONTRACT, userAddress],
        query: { enabled: !!userAddress },
    })
}
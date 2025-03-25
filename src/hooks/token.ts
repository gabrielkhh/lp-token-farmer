import { Address, erc20Abi } from "viem"
import { useReadContract } from "wagmi"
import { formatTokenAmountAsString } from "../utils"


export const useGetTokenName = (tokenAddress: Address | undefined) => {
    return useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'name',
        query: { enabled: !!tokenAddress },
    })
}

export const useGetTokenSymbol = (tokenAddress: Address | undefined) => {
    return useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
        query: { enabled: !!tokenAddress },
    })
}

export const useGetTokenDecimals = (tokenAddress: Address | undefined) => {
    return useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
        query: { enabled: !!tokenAddress },
    })
}

export const useGetTokenBalance = (tokenAddress: Address | undefined, userAddress: Address | undefined) => {
    const readResult = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress as Address],
        query: { enabled: !!tokenAddress && !!userAddress },
    })

    const { data: decimals } = useGetTokenDecimals(tokenAddress)

    // const formattedBalance = readResult.data !== undefined && decimals ? Number(readResult.data) / 10 ** Number(decimals) : undefined
    const formattedBalance = formatTokenAmountAsString(readResult.data ?? BigInt(0), decimals)

    return {
        rawBalance: readResult.data,
        formattedBalance,
        ...readResult
    }
}

export const useGetToken = (tokenAddress: Address | undefined) => {
    const { data: name } = useGetTokenName(tokenAddress as Address | undefined)
    const { data: symbol } = useGetTokenSymbol(tokenAddress as Address | undefined)
    const { data: decimals } = useGetTokenDecimals(tokenAddress as Address | undefined)

    return {
        name,
        symbol,
        decimals,
    }
}

export const useGetTokenInfoWithBalance = (tokenAddress: Address | undefined, userAddress: Address | undefined) => {
    const tokenInfo = useGetToken(tokenAddress)
    const tokenBalance = useGetTokenBalance(tokenAddress, userAddress)

    return {
        tokenInfo,
        tokenBalance
    }
}
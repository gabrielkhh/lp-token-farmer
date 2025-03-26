import { Address, erc20Abi } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import { MAX_UINT256 } from '../constants'
import { useMemo } from 'react'

export const useTokenApproval = ({
    tokenAddress,
    spenderContractAddress,
    userAddress,
    amount = MAX_UINT256,
}: {
    tokenAddress: Address
    spenderContractAddress: Address
    userAddress: Address
    amount?: bigint
}) => {
    const { data: allowance, isLoading: loadingAllowance } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress, spenderContractAddress],
    })

    const { writeContract, isPending, error, status } = useWriteContract()

    const approve = () => {
        writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            // Request for MAX_UINT256 for better UIUX else might need to keep requesting approval
            args: [spenderContractAddress, MAX_UINT256],
        })
    }

    const needsApproval = useMemo(() => {
        if (!allowance) return true
        return BigInt(allowance) < amount
    }, [allowance, amount])

    return {
        approve,
        isApproving: isPending,
        needsApproval,
        allowance,
        loadingAllowance,
        error,
        status
    }
}
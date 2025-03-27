import { Address, erc20Abi } from 'viem'
import { useConfig, useReadContract, useWriteContract } from 'wagmi'
import { MAX_UINT256 } from '../constants'
import { useMemo } from 'react'
import { waitForTransactionReceipt, WriteContractErrorType } from '@wagmi/core'
import { TransactionActionStatus } from '../types'

export const useTokenApproval = ({
    tokenAddress,
    spenderContractAddress,
    userAddress,
    amount = MAX_UINT256,
    isRevoke = false
}: {
    tokenAddress: Address
    spenderContractAddress: Address
    userAddress: Address
    amount?: bigint
    isRevoke?: boolean
}) => {
    const { data: allowance, isLoading: loadingAllowance } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress, spenderContractAddress],
    })

    const { writeContract, isPending, error, status, data: txHash } = useWriteContract()

    const approve = (onSuccess?: (txHash: string) => any, onError?: (error: WriteContractErrorType) => any, onSettled?: () => any) => {
        writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            // Request for MAX_UINT256 for better UIUX else might need to keep requesting approval
            args: [spenderContractAddress, isRevoke ? 0n : MAX_UINT256],
        }, {
            onSuccess: onSuccess,
            onError: onError,
            onSettled: onSettled,
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
        txHash,
        status
    }
}
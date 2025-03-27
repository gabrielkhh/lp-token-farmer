import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { Loader2, X } from 'tabler-icons-react'
import { Address } from 'viem'
import { useGetToken, useGetTokenInfoWithBalance } from '../hooks/token'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { calculateBigIntPercentage, decimalToBigInt, formatTokenAmountAsString } from '../utils'
import { pundixFarmContractConfig, PURSE_TOKEN } from '../constants'
import { waitForTransactionReceipt } from "@wagmi/core";
import toast from 'react-hot-toast'
import { useGetPoolInfo, useGetUserPendingRewards, useGetUserPositions } from '../hooks/pool'
import { NumericFormat } from 'react-number-format'

const WithdrawModal = ({
    isOpen,
    onClose,
    withdrawTokenAddress
}: {
    isOpen: boolean,
    onClose: Dispatch<SetStateAction<boolean>>
    withdrawTokenAddress: Address
}) => {
    const config = useConfig();
    const [withdrawAmountStr, setWithdrawAmountStr] = React.useState<string>('0');
    const [withdrawAmountInNumber, setWithdrawAmountInNumber] = React.useState<number>(0);
    const [isWithdrawPending, setIsWithdrawPending] = React.useState<boolean>(false);
    const { address: userWalletAddress } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();
    const lpTokenInfo = useGetTokenInfoWithBalance(withdrawTokenAddress, userWalletAddress)
    const userInfo = useGetUserPositions(withdrawTokenAddress, userWalletAddress);
    const purseTokenInfo = useGetToken(PURSE_TOKEN)

    const { data: userPendingRewards } = useGetUserPendingRewards(withdrawTokenAddress, userWalletAddress)

    const pendingReward = useMemo(() => {
        return formatTokenAmountAsString(userPendingRewards as bigint ?? 0n, purseTokenInfo.decimals)
    }, [userPendingRewards, purseTokenInfo.decimals])

    const handleTransactionSubmitted = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
        });

        if (transactionReceipt.status === "success") {
            setIsWithdrawPending(false)
            toast(<span>Withdraw Succcessful! <a href={`https://bscscan.com/tx/${txHash}`} target={"_blank"}>View Transaction</a></span>, { icon: '🎉', duration: 4000 })
        }
    };

    const handlePercentageFill = useCallback((e: React.MouseEvent<HTMLButtonElement>, percentage: number) => {
        e.preventDefault();
        const percentageAmount = calculateBigIntPercentage(userInfo?.amount ?? BigInt(0), percentage, lpTokenInfo.tokenInfo.decimals)
        setWithdrawAmountStr(percentageAmount)
    }, [lpTokenInfo, userInfo?.amount, lpTokenInfo.tokenBalance.data])

    const handleWithdrawBtn = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsWithdrawPending(true)
        // setTriggeredDepositButton(true)

        const amountToWithdrawRaw = decimalToBigInt(withdrawAmountStr, lpTokenInfo.tokenInfo.decimals)

        writeContract({
            ...pundixFarmContractConfig,
            functionName: 'withdraw',
            args: [withdrawTokenAddress, amountToWithdrawRaw],
        }, {
            onSuccess: handleTransactionSubmitted,
            onError: (error) => {
                setIsWithdrawPending(false)

                if (error.message.includes("User rejected")) {
                    toast.error("User rejected the transaction")
                } else {
                    console.error("Error executing transaction: ", error)
                    toast.error("An error occurred while withdrawing LP tokens")
                }
            }
        })

    }, [withdrawAmountStr, lpTokenInfo.tokenInfo.decimals])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50" onClick={() => onClose(false)}>
            <div className="flex flex-col gap-3 bg-background rounded-3xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Withdraw LP Tokens</h2>
                        <button className="text-orange-400 hover:bg-orange-500/10 rounded-full p-2 transition-colors duration-200 cursor-pointer" onClick={() => onClose(false)}>
                            <X />
                        </button>
                    </div>
                    <span className="text-xs text-white/40">You will also claim any pending rewards when you withdraw any amount of your LP tokens from the farm.</span>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-400 font-semibold text-sm mb-2">Amount to withdraw</label>
                    <div className="relative">
                        <div className="flex bg-white/10 rounded-lg p-4 border border-transparent focus-within:border-orange-400">
                            <NumericFormat
                                placeholder='69.420'
                                value={withdrawAmountStr}
                                valueIsNumericString={true}
                                allowNegative={false}
                                allowLeadingZeros={false}
                                isAllowed={(values) => {
                                    if (decimalToBigInt(values.value, lpTokenInfo.tokenInfo.decimals) > (lpTokenInfo.tokenBalance.rawBalance ?? BigInt(0))) return false
                                    return true
                                }}
                                className='bg-transparent w-full text-xl font-medium focus:outline-none'
                                onValueChange={(values, _sourceInfo) => {
                                    setWithdrawAmountStr(values.value)
                                    setWithdrawAmountInNumber(values.floatValue ?? 0)
                                }}
                            />
                        </div>

                        <div className="flex justify-between items-center mt-2 px-1 gap-3">
                            <div className="text-sm text-gray-400">
                                Staked: <span className="text-orange-400">{formatTokenAmountAsString(userInfo?.amount, lpTokenInfo.tokenInfo.decimals)} {lpTokenInfo.tokenInfo.symbol}</span>
                            </div>
                            <div className="flex space-x-2 text-white">
                                <button className="bg-orange-400 hover:bg-orange-500 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 25)}>
                                    25%
                                </button>
                                <button className="bg-orange-400 hover:bg-orange-500 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 50)}>
                                    50%
                                </button>
                                <button className="bg-orange-400 hover:bg-orange-500 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 75)}>
                                    75%
                                </button>
                                <button className="bg-orange-400 hover:bg-orange-500 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 100)}>
                                    Max
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-300/5 rounded-lg p-3 flex flex-col gap-1 items-center">
                    <span className="font-semibold text-lg">Pending Rewards</span>
                    <div className="font-bold text-2xl text-orange-400 flex flex-col items-center">
                        <span key={userPendingRewards as bigint} className="transition-opacity duration-300 animate-fade-in">{pendingReward}</span>
                        <span>{purseTokenInfo.symbol}</span>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button className="w-1/2 bg-white/10 cursor-pointer text-white font-semibold py-3 px-4 rounded-xl transition" onClick={() => onClose(false)}>
                        Cancel
                    </button>
                    <button
                        className={`flex w-1/2 items-center bg-gradient-to-r from-[#f9655b] to-[#ee821a] text-white font-semibold py-3 px-4 rounded-xl transition ${withdrawAmountInNumber === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-orange-400'}`}
                        onClick={(e) => { handleWithdrawBtn(e) }}
                        disabled={withdrawAmountInNumber === 0 || isWithdrawPending}
                    >
                        {isWithdrawPending ? <Loader2 className="w-full animate-spin" size={20} /> : (
                            <span className="w-full text-center">
                                Withdraw
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WithdrawModal
import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { Loader2, X } from 'tabler-icons-react'
import { Address } from 'viem'
import { useGetTokenInfoWithBalance } from '../hooks/token'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { calculateBigIntPercentage, decimalToBigInt, formatTokenAmountAsString } from '../utils'
import { pundixFarmContractConfig } from '../constants'
import { waitForTransactionReceipt } from "@wagmi/core";
import toast from 'react-hot-toast'
import { useGetUserPositions } from '../hooks/pool'
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
    const [isDepositPending, setIsDepositPending] = React.useState<boolean>(false);
    const { address: userWalletAddress } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();
    const lpTokenInfo = useGetTokenInfoWithBalance(withdrawTokenAddress, userWalletAddress)
    const userInfo = useGetUserPositions(withdrawTokenAddress, userWalletAddress);

    const handleTransactionSubmitted = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
        });

        if (transactionReceipt.status === "success") {
            setIsDepositPending(false)
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
        setIsDepositPending(true)
        // setTriggeredDepositButton(true)

        const amountToWithdrawRaw = decimalToBigInt(withdrawAmountStr, lpTokenInfo.tokenInfo.decimals)

        writeContract({
            ...pundixFarmContractConfig,
            functionName: 'withdraw',
            args: [withdrawTokenAddress, amountToWithdrawRaw],
        }, {
            onSuccess: handleTransactionSubmitted,
            onError: (error) => {
                setIsDepositPending(false)

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
            <div className="bg-gray-50 rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Withdraw LP Tokens</h2>
                    <button className="text-gray-400 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 cursor-pointer" onClick={() => onClose(false)}>
                        <X />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2">Amount to withdraw</label>
                    <div className="relative">
                        <div className="flex bg-gray-100 rounded-2xl p-4 border border-gray-100 focus-within:border-teal-400">
                            <NumericFormat
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
                                }}
                            />
                        </div>

                        <div className="flex justify-between items-center mt-2 px-1 gap-3">
                            <div className="text-sm text-gray-500">
                                Staked: <span className="text-gray-800">{formatTokenAmountAsString(userInfo?.amount, lpTokenInfo.tokenInfo.decimals)} {lpTokenInfo.tokenInfo.symbol}</span>
                            </div>
                            <div className="flex space-x-2 text-white">
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 25)}>
                                    25%
                                </button>
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 50)}>
                                    50%
                                </button>
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 75)}>
                                    75%
                                </button>
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 100)}>
                                    Max
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button className="w-1/2 bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-semibold py-3 px-4 rounded-xl transition" onClick={() => onClose(false)}>
                        Cancel
                    </button>
                    <button
                        className={`flex w-1/2 items-center bg-orange-300 text-white font-semibold py-3 px-4 rounded-xl transition ${withdrawAmountStr === '0' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-orange-400'}`}
                        onClick={(e) => {handleWithdrawBtn(e)}}
                        disabled={withdrawAmountStr === '0' || isDepositPending}
                    >
                        {isDepositPending ? <Loader2 className="w-full animate-spin" size={20} /> : (
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
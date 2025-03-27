import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { Loader2, X } from 'tabler-icons-react'
import { Address } from 'viem'
import { useGetTokenInfoWithBalance } from '../hooks/token'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { calculateBigIntPercentage, decimalToBigInt } from '../utils'
import { LP_FARM_CONTRACT, pundixFarmContractConfig } from '../constants'
import { waitForTransactionReceipt, WriteContractErrorType } from "@wagmi/core";
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast'
import { useTokenApproval } from '../hooks/tokenSpending'
import Link from 'next/link'
import { useGetUserPositions } from '../hooks/pool'

const DepositModal = ({
    isOpen,
    onClose,
    depositTokenAddress
}: {
    isOpen: boolean,
    onClose: Dispatch<SetStateAction<boolean>>
    depositTokenAddress: Address
}) => {
    const config = useConfig();
    const [depositAmountStr, setDepositAmountStr] = React.useState<string>('0');
    const [isDepositPending, setIsDepositPending] = React.useState<boolean>(false);
    const [depositAmountInNumber, setDepositAmountInNumber] = React.useState<number>(0);
    const { address: userWalletAddress } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { refetch: refetchStakedTokens } = useGetUserPositions(depositTokenAddress, userWalletAddress);

    const lpTokenInfo = useGetTokenInfoWithBalance(depositTokenAddress, userWalletAddress)

    const { approve, isApproving, needsApproval, allowance, error, status } = useTokenApproval({
        tokenAddress: depositTokenAddress,
        spenderContractAddress: LP_FARM_CONTRACT,
        userAddress: userWalletAddress as unknown as Address,
        amount: decimalToBigInt(depositAmountStr, lpTokenInfo.tokenInfo.decimals)
    })

    const depositWriteContract = useCallback(() => {
        // Initiate the process of creating the tx to deposit LP tokens
        const amountToDepositRaw = decimalToBigInt(depositAmountStr, lpTokenInfo.tokenInfo.decimals)

        writeContract({
            ...pundixFarmContractConfig,
            functionName: 'deposit',
            args: [depositTokenAddress, amountToDepositRaw],
        }, {
            onSuccess: handleDepositTransactionSubmitted,
            onError: (error) => {
                setIsDepositPending(false)

                if (error.message.includes("User rejected")) {
                    toast.error("User rejected the transaction")
                } else {
                    console.error("Error executing transaction: ", error)
                    toast.error("An error occurred while depositing LP tokens")
                }
            }
        })
    }, [depositAmountStr, lpTokenInfo.tokenInfo.decimals])

    const handleApproveTransactionSubmitted = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
        });

        if (transactionReceipt.status === "success") {
            toast(
                <div className="flex flex-col">
                    <span>Approve Token Spend Successful!</span>
                    <span className="text-orange-400 underline">
                        <Link href={`https://bscscan.com/tx/${txHash}`} target={"_blank"}>View Transaction</Link>
                    </span>
                </div>,
                { icon: '🎉', duration: 4000 }
            )

            // Token spend approved, now we can initiate the deposit itself
            depositWriteContract()
        } else {
            toast.error("An error occurred while approving LP token spending")
        }
    }

    const handleApproveTransactionFailed = useCallback((error: WriteContractErrorType) => {
        setIsDepositPending(false)
        if (error.message.includes("User rejected")) {
            toast.error("User rejected the transaction")
        } else {
            console.error("Error executing transaction: ", error)
            toast.error("An error occurred while depositing LP tokens")
        }
    }, [setIsDepositPending])

    const handleDepositTransactionSubmitted = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
        });

        setIsDepositPending(false)

        if (transactionReceipt.status === "success") {
            toast(
                <div className="flex flex-col">
                    <span>Deposit Successful!</span>
                    <span className="text-orange-400 underline">
                        <Link href={`https://bscscan.com/tx/${txHash}`} target={"_blank"}>View Transaction</Link>
                    </span>
                </div>,
                { icon: '🎉', duration: 4000 }
            )
        } else {
            toast.error("An error occurred while depositing LP tokens")
        }

        lpTokenInfo.tokenBalance.refetch();
        refetchStakedTokens();
    };

    const handlePercentageFill = useCallback((e: React.MouseEvent<HTMLButtonElement>, percentage: number) => {
        e.preventDefault();
        const percentageAmount = calculateBigIntPercentage(lpTokenInfo.tokenBalance.rawBalance ?? BigInt(0), percentage, lpTokenInfo.tokenInfo.decimals)
        setDepositAmountStr(percentageAmount)
    }, [lpTokenInfo, lpTokenInfo.tokenBalance.rawBalance, lpTokenInfo.tokenBalance.data])

    const handleDepositBtn = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsDepositPending(true)

        if (needsApproval) {
            approve(handleApproveTransactionSubmitted, handleApproveTransactionFailed)
        } else {
            depositWriteContract()
        }
    }, [depositAmountStr, needsApproval, approve])

    const handleCloseModal = () => {
        setDepositAmountStr('0')
        onClose(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50" onClick={() => handleCloseModal()}>
            <div className="flex flex-col gap-3 bg-background rounded-3xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Deposit LP Tokens</h2>
                    <button className="text-orange-400 hover:bg-orange-500/10 rounded-full p-2 transition-colors duration-200 cursor-pointer" onClick={() => handleCloseModal()}>
                        <X />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-400 font-semibold text-sm mb-1">Amount to deposit</label>
                    <div className="relative">
                        <div className="flex bg-white/10 rounded-lg p-4 border border-transparent focus-within:border-orange-400">
                            <NumericFormat
                                placeholder='69.420'
                                value={depositAmountStr}
                                valueIsNumericString={true}
                                allowNegative={false}
                                allowLeadingZeros={false}
                                isAllowed={(values) => {
                                    return decimalToBigInt(values.value, lpTokenInfo.tokenInfo.decimals) <= (lpTokenInfo.tokenBalance.rawBalance ?? BigInt(0))
                                }}
                                className='bg-transparent w-full text-xl font-medium focus:outline-none'
                                onValueChange={(values, _sourceInfo) => {
                                    setDepositAmountStr(values.value)
                                    setDepositAmountInNumber(values.floatValue ?? 0)
                                }}
                            />
                        </div>

                        <div className="flex justify-between items-center mt-2 px-1 gap-3">
                            <div className="text-sm text-gray-400">
                                Balance: <span className="text-orange-400">{lpTokenInfo.tokenBalance.formattedBalance} {lpTokenInfo.tokenInfo.symbol}</span>
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

                <div className="flex space-x-4">
                    <button className="w-1/2 bg-white/10 cursor-pointer text-white font-semibold py-3 px-4 rounded-xl transition" onClick={() => handleCloseModal()}>
                        Cancel
                    </button>
                    <button
                        className={`flex w-1/2 items-center bg-gradient-to-r from-[#f9655b] to-[#ee821a] text-white font-semibold py-3 px-4 rounded-xl transition ${depositAmountInNumber === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-orange-400'}`}
                        onClick={handleDepositBtn}
                        disabled={depositAmountInNumber === 0 || isDepositPending}
                    >
                        {isDepositPending ? <Loader2 className="w-full animate-spin" size={20} /> : (
                            <span className="w-full text-center">
                                Deposit
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DepositModal
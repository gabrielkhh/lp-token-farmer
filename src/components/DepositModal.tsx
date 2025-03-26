import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { Check, Loader2, X } from 'tabler-icons-react'
import { Address } from 'viem'
import { useGetTokenInfoWithBalance } from '../hooks/token'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { calculateBigIntPercentage, decimalToBigInt } from '../utils'
import { LP_FARM_CONTRACT, pundixFarmContractConfig } from '../constants'
import { waitForTransactionReceipt } from "@wagmi/core";
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast'
import { useTokenApproval } from '../hooks/tokenSpending'
import { TransactionActionStatus } from '../types'

const StatusMessage = ({ status, message }: { status: TransactionActionStatus; message: string }) => {
    let elColor = 'text-gray-500';
    let elIcon = <Loader2 className="animate-spin" size={12} />

    switch (status) {
        case "success":
            elColor = 'text-green-400';
            elIcon = <Check size={14} />
            break;
        case "error":
            elColor = 'text-red-400';
            elIcon = <X size={14} />
            break;
    }

    return (
        <div className={`flex items-center gap-1 ${elColor}`}>
            {elIcon}
            <span>{message}</span>
        </div>
    )
}

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
    const [triggeredDepositButton, setTriggeredDepositButton] = React.useState<boolean>(false);
    const { address: userWalletAddress } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();

    const lpTokenInfo = useGetTokenInfoWithBalance(depositTokenAddress, userWalletAddress)

    const { approve, isApproving, needsApproval, allowance, error, status } = useTokenApproval({
        tokenAddress: depositTokenAddress,
        spenderContractAddress: LP_FARM_CONTRACT,
        userAddress: userWalletAddress as unknown as Address,
        amount: decimalToBigInt(depositAmountStr, lpTokenInfo.tokenInfo.decimals)
    })

    const handleTransactionSubmitted = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
        });

        if (transactionReceipt.status === "success") {
            setIsDepositPending(false)
            toast(<span>Deposit Succcessful! <a className="text-orange-500 underline" href={`https://bscscan.com/tx/${txHash}`} target={"_blank"}>View Transaction</a></span>, { icon: '🎉', duration: 4000 })
        }
    };

    const handlePercentageFill = useCallback((e: React.MouseEvent<HTMLButtonElement>, percentage: number) => {
        e.preventDefault();
        const percentageAmount = calculateBigIntPercentage(lpTokenInfo.tokenBalance.rawBalance ?? BigInt(0), percentage, lpTokenInfo.tokenInfo.decimals)
        setDepositAmountStr(percentageAmount)
    }, [lpTokenInfo, lpTokenInfo.tokenBalance.rawBalance, lpTokenInfo.tokenBalance.data])

    const handleDepositBtn = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsDepositPending(true)
        setTriggeredDepositButton(true)

        if (needsApproval) {
            approve()

            while (status === "pending") {
                // Wait for the approval request to be handled by the user
            }
        }

        if (status === "success" || !needsApproval) {
            const amountToDepositRaw = decimalToBigInt(depositAmountStr, lpTokenInfo.tokenInfo.decimals)

            writeContract({
                ...pundixFarmContractConfig,
                functionName: 'deposit',
                args: [depositTokenAddress, amountToDepositRaw],
            }, {
                onSuccess: handleTransactionSubmitted,
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
        }
    }, [depositAmountStr, needsApproval, approve, lpTokenInfo.tokenInfo.decimals])

    const handleCloseModal = () => {
        setTriggeredDepositButton(false)
        onClose(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50" onClick={() => handleCloseModal()}>
            <div className="flex flex-col gap-3 bg-gray-50 rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Deposit LP Tokens</h2>
                    <button className="text-gray-400 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 cursor-pointer" onClick={() => handleCloseModal()}>
                        <X />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2">Amount to deposit</label>
                    <div className="relative">
                        <div className="flex bg-gray-100 rounded-2xl p-4 border border-gray-100 focus-within:border-teal-400">
                            <NumericFormat
                                value={depositAmountStr}
                                valueIsNumericString={true}
                                allowNegative={false}
                                allowLeadingZeros={false}
                                isAllowed={(values) => {
                                    if (decimalToBigInt(values.value, lpTokenInfo.tokenInfo.decimals) > (lpTokenInfo.tokenBalance.rawBalance ?? BigInt(0))) return false
                                    return true
                                }}
                                className='bg-transparent w-full text-xl font-medium focus:outline-none'
                                onValueChange={(values, _sourceInfo) => {
                                    setDepositAmountStr(values.value)
                                    setDepositAmountInNumber(values.floatValue ?? 0)
                                }}
                            />
                        </div>

                        <div className="flex justify-between items-center mt-2 px-1 gap-3">
                            <div className="text-sm text-gray-500">
                                Available: <span className="text-gray-800">{lpTokenInfo.tokenBalance.formattedBalance} {lpTokenInfo.tokenInfo.symbol}</span>
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
                    <button className="w-1/2 bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-semibold py-3 px-4 rounded-xl transition" onClick={() => handleCloseModal()}>
                        Cancel
                    </button>
                    <button
                        className={`flex w-1/2 items-center bg-orange-300 text-white font-semibold py-3 px-4 rounded-xl transition ${depositAmountInNumber === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-orange-400'}`}
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

                {/* {triggeredDepositButton && (<div className="flex flex-col mt-2 text-gray-500 font-medium text-sm">
                    {needsApproval && (<StatusMessage status={status} message={'Approve token spend'} />)}
                    <StatusMessage status={status} message={'Approve deposit transaction'} />
                </div>)} */}
            </div>
        </div >
    )
}

export default DepositModal
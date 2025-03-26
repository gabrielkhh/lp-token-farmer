import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useEstimateGas, useAccount } from 'wagmi';
import { Address, erc20Abi, parseGwei } from 'viem';
import { LP_FARM_CONTRACT, pundixFarmContractConfig } from '../constants';
import { useTokenApproval } from '../hooks/tokenSpending';
import Link from 'next/link';

const Home: NextPage = () => {
  const { address: userWalletAddress, isConnected } = useAccount()

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const { writeContract: approveWrite, data: approveTxHash } = useWriteContract()

  const { isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  const { data: poolAddress } = useReadContract({
    ...pundixFarmContractConfig,
    functionName: 'poolTokenList',
    args: [BigInt(1)],
  })

  const { data: userInfo } = useReadContract({
    ...pundixFarmContractConfig,
    functionName: 'userInfo',
    args: ["0xfc450e16016aF4e4197f5dB5Ca0d262fF8fD735a", "0xA7396814b9946f3fd1616410985aF0258412477c"],
  })

  // const { data: estimatedGas, isLoading, error } = useEstimateGas({
  //   ...pundixContractConfig,
  //   parameters: {
  //     functionName: 'deposit',
  //     args: [tokenAddress, parseEther('1')],
  //   }
  //   account: userAddress, // required!
  // })


  // console.log("dsa", poolAddress, tokenName, tokenSymbol, userInfo)

  // const handleApproveToken = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault()

  //   approveWrite({
  //     address: LP_FARM_TOKEN_A, // the ERC20 token contract
  //     abi: erc20Abi,
  //     functionName: 'approve',
  //     args: ["0x439ec8159740a9B9a579F286963Ac1C050aF31C8", BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")], // allow proxy to spend 1 token
  //   })
  // }

  // const { approve, isApproving, needsApproval, allowance } = useTokenApproval({
  //   tokenAddress: LP_FARM_TOKEN_A,
  //   spenderContractAddress: LP_FARM_CONTRACT,
  //   userAddress: userWalletAddress as unknown as Address,
  // })

  const handleDepositBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // approveWrite({
    //   address: "0xA7396814b9946f3fd1616410985aF0258412477c", // the ERC20 token contract
    //   abi: erc20Abi,
    //   functionName: 'approve',
    //   args: ["0x439ec8159740a9B9a579F286963Ac1C050aF31C8", BigInt(100)], // allow proxy to spend 1 token
    // })


    writeContract({
      ...pundixFarmContractConfig,
      functionName: 'deposit',
      args: ["0xfc450e16016aF4e4197f5dB5Ca0d262fF8fD735a", BigInt(1000000)],
      gas: parseGwei('0.001')
    })
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>LP Token Farmer</title>
        <meta
          content="This is a LP Token Farming DApp"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main>
        {/* <div>Purse Token Addy: {poolAddress?.toString()}</div>

        <button className="rounded-xl bg-orange-400 hover:bg-orange-500 p-3 text-white" onClick={handleApproveToken}>Approve</button>

        <button className="rounded-xl bg-orange-400 hover:bg-orange-500 p-3 text-white" onClick={handleDepositBtn}>Deposit</button>

        <div>{isPending ? "Transaction Pending" : "Not in Pending stage"}</div>
        <div>{isConfirming ? "Transaction Is Confirming" : "Not in Confirming stage/Not Confirmed"}</div>
        <div>{isSuccess ? "Transaction Success" : "Not in Succcess stage/Not successful"}</div> */}

        <section className="gradient-bg py-24 px-4 md:px-12">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-8">Welcome to LP Token Farmer</h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">Maximize your DeFi yields by farming rewards. Connect your wallet to start now!</p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
              {!isConnected ? (<ConnectButton />) : (
                <Link href="/farm" className="bg-purple-600 hover:bg-purple-700 font-bold py-3 px-6 rounded-xl">
                  <span className="text-white">Start Farming</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="bg-gray-100 shadow-lg rounded-xl p-8 transition duration-300 step-card">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-xl">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Provide Liquidity</h3>
                <p className="text-gray-600">Add liquidity to the supported pool on platforms like PancakeSwap to receive LP tokens. These represent your share of the pool.</p>
                <div className="mt-6 text-purple-400">
                  <Link target='_blank' href="https://pancakeswap.finance/v2/add/0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C/0x55d398326f99059fF775485246999027B3197955?increase=1" className="flex items-center">
                    Add Liquidity
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>


              <div className="bg-gray-100 shadow-lg rounded-xl p-8 transition duration-300 step-card">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-xl">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Stake Your LP Tokens</h3>
                <p className="text-gray-600">Connect your wallet and stake your LP tokens in our farming pool.</p>
                <div className="mt-6 text-purple-400">
                  <a href="#" className="flex items-center">
                    View pools
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="bg-gray-100 shadow-lg rounded-xl p-8 transition duration-300 step-card">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-xl">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Harvest Rewards</h3>
                <p className="text-gray-600">Earn yield farming rewards automatically. Harvest anytime or compound your earnings for even greater returns.</p>
                <div className="mt-6 text-purple-400">
                  <a href="#" className="flex items-center">
                    Calculate APY
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;

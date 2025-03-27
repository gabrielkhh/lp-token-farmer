import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const Home: NextPage = () => {
  const { isConnected } = useAccount()

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
        <section className="gradient-bg py-24 px-4 md:px-12">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-8">Welcome to LP Token Farmer</h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">Maximize your DeFi yields by farming rewards. Connect your wallet to start now!</p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
              {!isConnected ? (
                <div className="flex w-full justify-center">
                  <ConnectButton />
                </div>
              ) : (
                <Link href="/farm" className="bg-gradient-to-r from-[#f9655b] to-[#ee821a] font-bold py-3 px-6 rounded-xl">
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

              <div className="bg-gray-100/10 shadow-lg rounded-xl p-8 transition duration-300 step-card">
                <div className="bg-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-xl">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Provide Liquidity</h3>
                <p className="text-white/50">Add liquidity to the supported pools on platforms like PancakeSwap to receive LP tokens. These represent your share of the pool.</p>
              </div>


              <div className="bg-gray-100/10 shadow-lg rounded-xl p-8 transition duration-300 step-card">
                <div className="bg-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-xl">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Stake Your LP Tokens</h3>
                <p className="text-white/50">Connect your wallet and stake your LP tokens in our farms.</p>
                <div className="mt-6 text-orange-400">
                  <Link href="/farm" className="flex items-center">
                    View Farms
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="bg-gray-100/10 shadow-lg rounded-xl p-8 transition duration-300 step-card">
                <div className="bg-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-xl">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Harvest Rewards</h3>
                <p className="text-white/50">Earn farming rewards automatically. Watch your rewards accrue live. The more you stake, the more you earn!</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

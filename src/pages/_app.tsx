import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';
import { bsc } from 'viem/chains';
import SharedLayout from '../components/SharedLayout';
import { Toaster } from 'react-hot-toast';

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider initialChain={bsc} theme={darkTheme({
          accentColor: '#DD7717'
        })}>
          <Toaster toastOptions={{
            position: 'bottom-right',
            className: 'bg-black',
            style: {
              padding: '12px',
              color: 'white',
              background: '#2F2A22',
              boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
            }
          }} />
          <SharedLayout>
            <Component {...pageProps} />
          </SharedLayout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;

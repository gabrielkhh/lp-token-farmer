import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import {
  bsc
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'LP Farmer App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    bsc,
  ],
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org/")
  },
  ssr: true,
});

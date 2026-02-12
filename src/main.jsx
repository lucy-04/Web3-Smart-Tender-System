import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { config } from './wagmi';

const queryClient = new QueryClient();

import { sepolia } from 'wagmi/chains';

createRoot(document.getElementById('root')).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider initialChain={sepolia}>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
)

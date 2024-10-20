import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Clerk hook for user authentication
import { useRouter } from 'next/router'; // To handle redirects
import Head from 'next/head';
import { SignInButton } from '@clerk/nextjs'; // Clerk login button
import styles from '../styles/Home.module.css';

const Home = () => {
  const { isSignedIn } = useUser(); // Clerk user authentication status
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Handle redirection manually based on Clerk authentication
  useEffect(() => {
    if (isSignedIn) {
      // If already logged in via Clerk, redirect to dashboard
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  // Handle wallet connection without wagmi connectors
  const handleWalletLogin = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        router.push('/dashboard'); // Redirect after successful connection
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('MetaMask or an Ethereum-compatible browser is required.');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Welcome to Crocial</title>
        <meta name="description" content="Explore and interact with companies and dApps in the Web3 world" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Crocial</h1>
        <p className={styles.description}>
          The first platform where Web3 meets social networking. Interact directly with your favorite companies and dApps, all in one place.
        </p>

        {/* Clerk Sign-In Button */}
        {!isSignedIn && (
          <SignInButton mode="modal" redirectUrl="/dashboard">
            <button className={styles.button}>Join Crocial Today!</button>
          </SignInButton>
        )}

        {/* Wallet Sign-In Button */}
        {!isConnected && (
          <button onClick={handleWalletLogin} className={styles.button}>
            Connect MetaMask Wallet
          </button>
        )}

        <p className={styles.cta}>Connect. Explore. Own the future.</p>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Crocial - The Web3 Social Hub</p>
      </footer>
    </div>
  );
};

export default Home;
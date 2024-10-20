import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs'; // Clerk hook for user authentication
import { useRouter } from 'next/router'; // To handle redirects
import Head from 'next/head';
import { SignInButton } from '@clerk/nextjs'; // Clerk login button
import styles from '../styles/Home.module.css';
import { useAccount, useConnect } from 'wagmi'; // wagmi for Web3 connections
import { InjectedConnector } from 'wagmi/connectors/injected'; // Ledger / MetaMask connectors

const Home = () => {
  const { isSignedIn } = useUser(); // Clerk user authentication status
  const router = useRouter();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { isConnected, address } = useAccount();

  // Handle redirection manually based on Clerk authentication
  useEffect(() => {
    if (isSignedIn) {
      // If already logged in via Clerk, redirect to dashboard
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  const handleLedgerLogin = async () => {
    try {
      // Trigger Ledger login/connect
      await connect();
      // Redirect to dashboard after successful connection
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to connect Ledger:', error);
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

        {/* Ledger Sign-In Button */}
        {!isConnected && (
          <button onClick={handleLedgerLogin} className={styles.button}>
            Connect Ledger Wallet
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
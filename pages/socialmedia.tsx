import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs'; // Clerk hook and UserButton
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useClerk } from '@clerk/nextjs';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk(); // Use Clerk's signOut function
  const [ethBalance, setEthBalance] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  // Fetch wallet balance using ethers.js
  useEffect(() => {
    if (user?.primaryWeb3Wallet) {
      const fetchBalance = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const balance = await provider.getBalance(user.primaryWeb3Wallet.web3Wallet);
          setEthBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      };
      fetchBalance();
    }
  }, [user]);

  // Handle sign-out and redirect to the home page
  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' }); // Redirect after sign out
  };

  // Navigate to social feed page
  const goToSocialMedia = () => {
    router.push('/socialMedia'); // Redirect to the Social Media page
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.userSection}>
          <UserButton />
          <div className={styles.userActions}>
            <button className={styles.userSettingsButton} onClick={handleSignOut}>
              Log Out / User Settings
            </button>
          </div>
        </div>
      </header>

      <aside className={styles.sidebar}>
        <h2>Welcome to your Dashboard</h2>
        <nav className={styles.navMenu}>
          <ul>
            <li><a href="#wallet">My Wallet</a></li>
            <li><a href="#dapps">Explore dApps</a></li>
            <li><a href="#settings">Settings</a></li>
            <li>
              <button className={styles.navLink} onClick={goToSocialMedia}>
                Social Feed
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <section id="wallet">
          <h3>My Wallet</h3>
          {user?.primaryWeb3Wallet ? (
            <div>
              <p><strong>Wallet Address:</strong> {user.primaryWeb3Wallet.web3Wallet}</p>
              <p><strong>ETH Balance:</strong> {ethBalance} ETH</p>
            </div>
          ) : (
            <p>Loading wallet...</p>
          )}
        </section>

        <section id="dapps">
          <h3>Explore dApps</h3>
          <p>Discover decentralized apps on Crocial.</p>
        </section>

        <section id="settings">
          <h3>Settings</h3>
          <p>Manage your account settings and preferences.</p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
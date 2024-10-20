import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs'; // Clerk hook and UserButton
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useClerk } from '@clerk/nextjs';
import styles from '../styles/Dashboard.module.css';

// Circle API for USDC/EURC payments
const CircleAPI = 'https://api.circle.com/v1/payments'; // Replace with actual production or sandbox API URL
const CircleApiKey = process.env.NEXT_PUBLIC_CIRCLE_API_KEY; // Ensure API key is stored securely in the environment

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk(); // Clerk's signOut function
  const [ethBalance, setEthBalance] = useState('');
  const [usdcBalance, setUsdcBalance] = useState(0); // USDC balance state
  const [eurcBalance, setEurcBalance] = useState(0); // EURC balance state
  const [posts, setPosts] = useState([]); // Posts state
  const [newPostText, setNewPostText] = useState(''); // New post text
  const [newPostImage, setNewPostImage] = useState(null); // New post image
  const [messages, setMessages] = useState([]); // Messages state
  const [paymentAmount, setPaymentAmount] = useState(''); // Payment amount
  const [recipientWallet, setRecipientWallet] = useState(''); // Recipient wallet address
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

          // Fetch stablecoin balances (USDC/EURC)
          fetchCircleBalances(user.primaryWeb3Wallet.web3Wallet);
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      };
      fetchBalance();
    }
  }, [user]);

  // Example function to fetch USDC/EURC balances from Circle API
  const fetchCircleBalances = async (walletAddress) => {
    try {
      const response = await fetch(`${CircleAPI}/wallets/${walletAddress}`, {
        headers: {
          Authorization: `Bearer ${CircleApiKey}`,
        },
      });
      const data = await response.json();
      setUsdcBalance(data.usdcBalance);
      setEurcBalance(data.eurcBalance);
    } catch (error) {
      console.error('Error fetching USDC/EURC balances:', error);
    }
  };

  // Handle sign-out and redirect to the home page
  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' });
  };

  // Fetch messages from the server
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages(); // Load messages when the dashboard loads
  }, []);

  // Handle post submission
  const handlePostSubmit = (e) => {
    e.preventDefault();

    const newPost = {
      id: Date.now(),
      text: newPostText,
      image: newPostImage ? URL.createObjectURL(newPostImage) : null,
      user: user.fullName || user.username,
      upvotes: 0,
    };

    setPosts([newPost, ...posts]); // Add new post to state
    setNewPostText(''); // Clear text input
    setNewPostImage(null); // Clear image input
  };

  // Send USDC/EURC payments
  const sendPayment = async () => {
    try {
      const response = await fetch(CircleAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CircleApiKey}`,
        },
        body: JSON.stringify({
          amount: {
            currency: 'USD', // Change to 'EUR' for EURC
            amount: paymentAmount,
          },
          destination: {
            address: recipientWallet,
          },
          source: {
            type: 'wallet',
            id: user.primaryWeb3Wallet.web3Wallet,
          },
          idempotencyKey: Date.now().toString(),
        }),
      });

      const data = await response.json();
      if (data.status === 'confirmed') {
        alert(`Payment of ${paymentAmount} USDC sent to ${recipientWallet}`);
      } else {
        console.error('Payment failed:', data);
      }
    } catch (error) {
      console.error('Error sending payment:', error);
    }
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
            <li><a href="/socialMedia">Social Feed</a></li>
            <li><a href="/aistudio">AI Art Studio</a></li>
            <li><a href="/messages">Messages</a></li>
            <li><a href="#settings">Settings</a></li>
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
              <p><strong>USDC Balance:</strong> {usdcBalance} USDC</p>
              <p><strong>EURC Balance:</strong> {eurcBalance} EURC</p>
            </div>
          ) : (
            <p>Loading wallet...</p>
          )}
        </section>

        {/* Payment Section */}
        <section id="payment">
          <h3>Send USDC or EURC</h3>
          <input
            type="text"
            placeholder="Recipient Wallet"
            value={recipientWallet}
            onChange={(e) => setRecipientWallet(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <button onClick={sendPayment} className={styles.sendPaymentButton}>
            Send Payment
          </button>
        </section>

        {/* Post Feed Section */}
        <section id="post-feed">
          <h3>Post Feed</h3>
          {posts.length ? (
            posts.map((post) => (
              <div key={post.id} className={styles.post}>
                <p><strong>{post.user}</strong></p>
                <p>{post.text}</p>
                {post.image && <img src={post.image} alt="Post content" className={styles.postImage} />}
                <button onClick={() => handleUpvote(post.id)} className={styles.upvoteButton}>
                  👍 {post.upvotes}
                </button>
              </div>
            ))
          ) : (
            <p>No posts yet. Be the first to post!</p>
          )}
        </section>

        {/* Messages Section */}
        <section id="messages">
          <h3>Recent Messages</h3>
          {messages.length ? (
            messages.map((msg, index) => (
              <div key={index}>
                <p><strong>{msg.sender}</strong>: {msg.text}</p>
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
          <p>
            Go to <a href="/messages">Messages</a> to send and receive more.
          </p>
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
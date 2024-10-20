import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs'; // Clerk hook and UserButton
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useClerk } from '@clerk/nextjs';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk(); // Clerk's signOut function
  const [ethBalance, setEthBalance] = useState('');
  const [posts, setPosts] = useState([]); // State for posts
  const [newPostText, setNewPostText] = useState(''); // State for new post text
  const [newPostImage, setNewPostImage] = useState(null); // State for new post image
  const [messages, setMessages] = useState([]); // State for messages
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

  // Handle upvoting posts
  const handleUpvote = (postId) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
    );
    setPosts(updatedPosts);
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
            <li><a href="/socialMedia">Social Feed</a></li> {/* Link to social media */}
            <li><a href="/aistudio">AI Art Studio</a></li> {/* Corrected link to AI Art Studio */}
            <li><a href="/messages">Messages</a></li> {/* Link to messaging */}
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
            </div>
          ) : (
            <p>Loading wallet...</p>
          )}
        </section>

        {/* Social Media Post Section */}
        <section id="make-post">
          <h3>Make a Social Media Post</h3>
          <form onSubmit={handlePostSubmit} className={styles.postForm}>
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What's on your mind?"
              className={styles.textArea}
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPostImage(e.target.files[0])}
              className={styles.imageInput}
            />
            <button className={styles.postButton} type="submit">Post</button>
          </form>
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

        {/* AI Art Studio Section */}
        <section id="ai-art-studio">
          <h3>AI Art Studio</h3>
          <p>
            Create and mint your own AI-generated art in the <a href="/aistudio">AI Art Studio</a>.
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
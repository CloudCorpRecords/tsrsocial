import React, { useState, useEffect } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Connect to Ethereum provider (MetaMask)
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Initialize XMTP client
        const xmtp = await Client.create(signer);

        // Retrieve all conversations for the connected user
        const conversations = await xmtp.conversations.list();

        // Fetch all messages for each conversation
        const allMessages = [];
        for (const convo of conversations) {
          const convoMessages = await convo.messages();
          allMessages.push({
            peerAddress: convo.peerAddress,
            messages: convoMessages.map((msg) => ({
              content: msg.content,
              timestamp: msg.sent,
            })),
          });
        }

        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div>
      <h1>Messages</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        messages.map((convo, idx) => (
          <div key={idx}>
            <h2>Conversation with: {convo.peerAddress}</h2>
            {convo.messages.map((msg, i) => (
              <div key={i}>
                <p>{msg.content}</p>
                <p>{new Date(msg.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default Messages;
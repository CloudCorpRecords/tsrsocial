import React, { useState, useEffect } from 'react';
import { openframes } from 'frames.js/middleware';
import { createFrames } from 'frames.js/next';
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from 'frames.js/xmtp';

export const frames = createFrames({
  middleware: [
    openframes({
      clientProtocol: {
        id: "xmtp",
        version: "2024-02-09",
      },
      handler: {
        isValidPayload: (body: JSON) => isXmtpFrameActionPayload(body),
        getFrameMessage: async (body: JSON) => {
          if (!isXmtpFrameActionPayload(body)) {
            return undefined;
          }
          // Extract XMTP message and verified wallet
          const result = await getXmtpFrameMessage(body);
          const { verifiedWalletAddress } = result;
          return { ...result };
        },
      },
    }),
  ],
});

const MessagingPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to send a message
  const sendMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const messageData = await response.json();
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages when the component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    loadMessages();
  }, []);

  return (
    <div>
      <h2>Messages</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>{msg.text}</p>
            <small>From: {msg.sender}</small>
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here"
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
};

export default MessagingPage;
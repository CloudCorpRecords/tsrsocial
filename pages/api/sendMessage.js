import { sendXmtpMessage } from 'frames.js/xmtp'; // Hypothetical utility

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    const response = await sendXmtpMessage(message); // Send message via XMTP
    return res.status(200).json({ message: 'Message sent successfully', response });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send message', error });
  }
}
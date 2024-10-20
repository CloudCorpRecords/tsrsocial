import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ethers } from 'ethers';
import { supabase } from '../supabaseClient';
import styles from '../styles/AIStudio.module.css';

const AIStudio = () => {
  const { user } = useUser();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to generate an image using the backend API
  const generateImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      setError('Failed to generate the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to convert the image into a video (can remain unchanged)
  const convertToVideo = async () => {
    setLoading(true);
    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
    });

    try {
      const output = await replicate.run('ali-vilab/i2vgen-xl', {
        input: {
          image: generatedImage,
          prompt: 'Dynamic video from generated image',
          max_frames: 16,
          guidance_scale: 9,
          num_inference_steps: 50,
        },
      });
      setVideo(output[0]);
    } catch (error) {
      console.error('Video conversion failed:', error);
      setError('Failed to convert the image to video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to mint the final output to Polygon (can remain unchanged)
  const mintToPolygon = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      console.log('Minting NFT for:', address);
    } catch (error) {
      console.error('Minting failed:', error);
    }
  };

  return (
    <div className={styles.studioContainer}>
      <h2>Create Your Art</h2>
      <div className={styles.formGroup}>
        <input
          type="text"
          placeholder="Describe your image..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={styles.input}
        />
        <button onClick={generateImage} disabled={loading} className={styles.generateButton}>
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {generatedImage && (
        <>
          <div className={styles.result}>
            <img src={generatedImage} alt="Generated" className={styles.image} />
          </div>
          <button onClick={convertToVideo} disabled={loading} className={styles.convertButton}>
            {loading ? 'Converting to Video...' : 'Convert to Video'}
          </button>
        </>
      )}

      {video && (
        <>
          <div className={styles.result}>
            <video src={video} controls className={styles.video}></video>
          </div>
          <button onClick={mintToPolygon} className={styles.mintButton}>
            Mint to Polygon
          </button>
        </>
      )}
    </div>
  );
};

export default AIStudio;
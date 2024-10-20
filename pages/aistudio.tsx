import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ethers } from 'ethers';
import { supabase } from '../supabaseClient'; // For storing user interactions, if needed
import styles from '../styles/AIStudio.module.css';
import Replicate from 'replicate'; // Make sure to import Replicate correctly

const AIStudio = () => {
  const { user } = useUser();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // New state to manage errors

  // Function to generate an image using the Replicate API
  const generateImage = async () => {
    setLoading(true);
    setError(null); // Reset error on each attempt

    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN, // Make sure the token is available
    });

    try {
      const output = await replicate.run('black-forest-labs/flux-schnell', {
        input: {
          prompt,
          go_fast: true,
          megapixels: '1',
          num_outputs: 1,
          aspect_ratio: '1:1',
          output_format: 'webp', // Use webp format as specified
          output_quality: 80,
          num_inference_steps: 4,
        },
      });
      setGeneratedImage(output[0]); // Assuming the API returns an array of image URLs
    } catch (error) {
      console.error('Image generation failed:', error);
      setError('Failed to generate the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to convert the image into a video using the second AI model
  const convertToVideo = async () => {
    setLoading(true);
    const replicate = new Replicate({
      auth: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN,
    });

    try {
      const output = await replicate.run('ali-vilab/i2vgen-xl', {
        input: {
          image: generatedImage, // Pass the generated image URL here
          prompt: 'Dynamic video from generated image',
          max_frames: 16,
          guidance_scale: 9,
          num_inference_steps: 50,
        },
      });
      setVideo(output[0]); // The generated video
    } catch (error) {
      console.error('Video conversion failed:', error);
      setError('Failed to convert the image to video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to mint the final output to Polygon
  const mintToPolygon = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // Connect to the user's wallet
      const address = await signer.getAddress();

      // Here you would use a contract to mint the NFT (not shown in full detail here)
      // You would send a request to a Polygon-based smart contract to mint the asset

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
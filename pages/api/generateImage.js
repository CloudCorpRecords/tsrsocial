import Replicate from 'replicate';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN, // Use your Replicate API token here
  });

  try {
    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        go_fast: true,
        megapixels: '1',
        num_outputs: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
      },
    });
    return res.status(200).json({ imageUrl: output[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate image', error });
  }
}
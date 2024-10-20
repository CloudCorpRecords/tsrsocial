import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client setup
import styles from '../styles/SocialMedia.module.css'; // Import your CSS styles

const SocialMedia = () => {
  const [posts, setPosts] = useState([]); // State to store posts
  const [newPostText, setNewPostText] = useState(''); // Text for new post
  const [newPostImage, setNewPostImage] = useState(null); // Image for new post
  const [uploading, setUploading] = useState(false); // Track if uploading
  const [uploadError, setUploadError] = useState(null); // Error handling for uploads

  // Fetch posts from Supabase when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(posts);
      }
    };

    fetchPosts();
  }, []);

  // Handle image upload to Supabase Storage
  const handleImageUpload = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    setUploading(true);
    setUploadError(null);

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    setUploading(false);

    if (error) {
      console.error('Error uploading image:', error);
      setUploadError(error.message);
      return null;
    }

    return supabase.storage
      .from('post-images')
      .getPublicUrl(filePath).publicUrl;
  };

  // Handle post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = null;

    if (newPostImage) {
      imageUrl = await handleImageUpload(newPostImage);
    }

    const newPost = {
      content: newPostText,
      image_url: imageUrl,
      upvotes: 0,
      created_at: new Date().toISOString(),
    };

    const { data: insertedPost, error } = await supabase
      .from('posts')
      .insert([newPost]);

    if (error) {
      console.error('Error creating post:', error);
    } else {
      setPosts([insertedPost[0], ...posts]); // Add the new post to the posts state
      setNewPostText(''); // Clear the text input
      setNewPostImage(null); // Clear the image input
    }
  };

  // Handle upvoting posts
  const handleUpvote = async (postId) => {
    const postToUpdate = posts.find((post) => post.id === postId);
    const updatedUpvotes = postToUpdate.upvotes + 1;

    const { error } = await supabase
      .from('posts')
      .update({ upvotes: updatedUpvotes })
      .eq('id', postId);

    if (error) {
      console.error('Error upvoting post:', error);
    } else {
      const updatedPosts = posts.map((post) =>
        post.id === postId ? { ...post, upvotes: updatedUpvotes } : post
      );
      setPosts(updatedPosts);
    }
  };

  return (
    <div className={styles.socialMediaContainer}>
      <h2>Social Media Feed</h2>

      {/* Form to create a new post */}
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
        <button type="submit" className={styles.postButton} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Post'}
        </button>
        {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
      </form>

      {/* Displaying the posts feed */}
      <div className={styles.postsFeed}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className={styles.post}>
              <p>{post.content}</p>
              {post.image_url && <img src={post.image_url} alt="Post content" className={styles.postImage} />}
              <button onClick={() => handleUpvote(post.id)} className={styles.upvoteButton}>
                👍 {post.upvotes}
              </button>
            </div>
          ))
        ) : (
          <p>No posts yet. Be the first to post!</p>
        )}
      </div>
    </div>
  );
};

export default SocialMedia;
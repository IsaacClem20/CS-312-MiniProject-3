
import { useState } from 'react';

function BlogPostForm({ onPostCreated }) {

    // Store the form values
    const [formData, setFormData] = useState({
        title: '',
        body: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update state whenever the user types
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData(previousData => ({
            ...previousData,
            [name]: value
        }));
    }

    // Submit a new blog post
    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Could not create blog post.'
                );
            }

            // Send the new post back to the parent App
            onPostCreated(data.post);

            // Clear the form after successful submission
            setFormData({
                title: '',
                body: ''
            });

            setSuccess('Blog post created successfully!');

        } catch (error) {
            console.error('Post creation error:', error);
            setError(error.message || 'Could not create your post.');

        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="post-form-container">

            <h2>Create a New Post</h2>

            <form onSubmit={handleSubmit}>

                <label htmlFor="title">Blog Title:</label>

                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={255}
                    required
                />

                <label htmlFor="body">Blog Content:</label>

                <textarea
                    id="body"
                    name="body"
                    rows="8"
                    value={formData.body}
                    onChange={handleChange}
                    required
                />

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="form-success" role="status">
                        {success}
                    </p>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Post...' : 'Create Post'}
                </button>

            </form>

        </div>
    );
}

export default BlogPostForm;

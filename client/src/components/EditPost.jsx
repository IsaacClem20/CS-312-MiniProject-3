
import { useState, useEffect } from 'react';
import {
    useParams,
    useNavigate,
    Link
} from 'react-router-dom';

function EditPost({ onPostUpdated }) {

    // Retrieve the post ID from the URL
    const { id } = useParams();

    const navigate = useNavigate();

    // Store the existing post information
    const [formData, setFormData] = useState({
        title: '',
        body: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [loadError, setLoadError] = useState('');


    // Retrieve the existing post from Express
    useEffect(() => {

        let isMounted = true;

        async function loadPost() {

            try {

                const response = await fetch(`/api/blogs/${id}`, {
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Could not load the blog post.'
                    );
                }

                if (isMounted) {

                    // Populate the form with existing post information
                    setFormData({
                        title: data.post.title,
                        body: data.post.body
                    });

                }

            } catch (error) {

                console.error('Error loading post:', error);

                if (isMounted) {
                    setLoadError(error.message);
                }

            } finally {

                if (isMounted) {
                    setIsLoading(false);
                }

            }
        }

        loadPost();

        return () => {
            isMounted = false;
        };

    }, [id]);


    // Update form state when the user types
    function handleChange(event) {

        const { name, value } = event.target;

        setFormData(previousData => ({
            ...previousData,
            [name]: value
        }));

    }


    // Submit the updated blog post
    async function handleSubmit(event) {

        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {

            const response = await fetch(`/api/blogs/${id}`, {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(formData)

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Could not update the blog post.'
                );
            }

            // Update the post in the parent application
            onPostUpdated(data.post);

            // Return to the homepage
            navigate('/');

        } catch (error) {

            console.error('Error updating post:', error);

            setError(error.message || 'Could not update your post.');

        } finally {

            setIsSubmitting(false);

        }

    }


    // Display a loading message while retrieving the post
    if (isLoading) {
        return (
            <div className="edit-page">
                <p>Loading blog post...</p>
            </div>
        );
    }


    // Display an error if the post cannot be retrieved
    if (loadError) {
        return (
            <div className="edit-page">

                <h1>Unable to Edit Post</h1>

                <p className="form-error" role="alert">
                    {loadError}
                </p>

                <Link to="/">Return to Homepage</Link>

            </div>
        );
    }


    return (

        <div className="post-form-container edit-page">

            <h1>Edit Blog Post</h1>

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
                    rows="10"
                    value={formData.body}
                    onChange={handleChange}
                    required
                />


                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}


                <button type="submit" disabled={isSubmitting}>

                    {isSubmitting ? 'Saving Changes...' : 'Save Changes'}

                </button>

                <button
                    type="button"
                    className="cancel-button"
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>

            </form>

        </div>

    );

}

export default EditPost;




import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostList({ posts, user, onPostDeleted }) {

    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [deletingPostId, setDeletingPostId] = useState(null);


    // Format the database timestamp for display
    function formatDate(date) {

        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

    }


    // Delete a blog post
    async function handleDelete(postId, postTitle) {

        // Ask for confirmation before deleting
        const confirmed = window.confirm(
            `Are you sure you want to delete "${postTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        setError('');
        setDeletingPostId(postId);

        try {

            const response = await fetch(`/api/blogs/${postId}`, {

                method: 'DELETE',

                credentials: 'include'

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Could not delete the blog post.'
                );
            }

            // Remove the deleted post from the homepage
            onPostDeleted(postId);

        } catch (error) {

            console.error('Error deleting post:', error);

            setError(error.message || 'Could not delete the post.');

        } finally {

            setDeletingPostId(null);

        }

    }


    return (

        <div className="post-list">

            <h2>Blog Posts</h2>

            <p>Number of posts: {posts.length}</p>


            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}


            {posts.length === 0 ? (

                <p>No blog posts have been created yet.</p>

            ) : (

                posts.map(post => (

                    <article key={post.blog_id}>

                        <h3>{post.title}</h3>

                        <p className="post-author">
                            by {post.creator_name}
                        </p>

                        <p className="post-date">
                            Posted on {formatDate(post.date_created)}
                        </p>

                        <p className="post-body">
                            {post.body}
                        </p>


                        {/* Only display buttons to the post creator */}
                        {user &&
                            user.user_id === post.creator_user_id && (

                            <div className="post-actions">

                                <button
                                    type="button"
                                    className="edit-button"
                                    onClick={() =>
                                        navigate(`/edit/${post.blog_id}`)
                                    }
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    className="delete-button"
                                    onClick={() =>
                                        handleDelete(
                                            post.blog_id,
                                            post.title
                                        )
                                    }
                                    disabled={
                                        deletingPostId === post.blog_id
                                    }
                                >
                                    {deletingPostId === post.blog_id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                </button>

                            </div>

                        )}

                    </article>

                ))

            )}

        </div>

    );

}

export default PostList;

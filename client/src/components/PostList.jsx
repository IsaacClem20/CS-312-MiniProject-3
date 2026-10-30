
function PostList({ posts, user }) {

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

    return (
        <div className="post-list">

            <h2>Blog Posts</h2>

            <p>Number of posts: {posts.length}</p>

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

                        {user &&
                            user.user_id === post.creator_user_id && (

                            <div className="post-actions">

                                <button
                                    type="button"
                                    disabled
                                    title="Editing will be implemented in Step 7"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    disabled
                                    title="Deletion will be implemented in Step 8"
                                >
                                    Delete
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

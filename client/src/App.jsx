


import { useState, useEffect } from 'react';

import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    Navigate
} from 'react-router-dom';

import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import BlogPostForm from './components/BlogPostForm';
import PostList from './components/PostList';

import './App.css';


// Homepage component
function HomePage({
    user,
    posts,
    postsLoading,
    postsError,
    onPostCreated
}) {

    return (
        <div className="app-shell">

            <h1>Isaac's Crazy Blog</h1>

            <p>Welcome to my blog!</p>

            <p>Please be respectful of others.</p>


            {/* Display login information */}
            {user ? (

                <div className="user-info">

                    <p>Signed in as {user.name}</p>

                </div>

            ) : (

                <div className="home-links">

                    <Link to="/signin">Sign In</Link>

                    {' | '}

                    <Link to="/signup">Sign Up</Link>

                </div>

            )}


            {/* Show the post creation form only to signed-in users */}
            {user ? (

                <BlogPostForm onPostCreated={onPostCreated} />

            ) : (

                <p>Sign in to create a blog post.</p>

            )}


            {/* Display all blog posts */}
            {postsLoading ? (

                <p>Loading blog posts...</p>

            ) : postsError ? (

                <p className="form-error">{postsError}</p>

            ) : (

                <PostList posts={posts} user={user} />

            )}

        </div>
    );
}


function App() {

    // Currently signed-in user
    const [user, setUser] = useState(null);

    // Blog posts retrieved from Express
    const [posts, setPosts] = useState([]);

    // Loading and error states
    const [authLoading, setAuthLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState('');


    // Check whether a user is signed in
    useEffect(() => {

        let isMounted = true;

        async function checkAuth() {

            try {

                const response = await fetch('/api/auth/me', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Could not check login status.');
                }

                const data = await response.json();

                if (isMounted) {
                    setUser(data.user);
                }

            } catch (error) {

                console.error('Authentication check failed:', error);

                if (isMounted) {
                    setUser(null);
                }

            } finally {

                if (isMounted) {
                    setAuthLoading(false);
                }

            }
        }

        checkAuth();

        return () => {
            isMounted = false;
        };

    }, []);


    // Retrieve all blog posts from Express
    useEffect(() => {

        let isMounted = true;

        async function loadPosts() {

            try {

                const response = await fetch('/api/blogs', {
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Could not load blog posts.'
                    );
                }

                if (isMounted) {
                    setPosts(data.posts);
                }

            } catch (error) {

                console.error('Error loading blog posts:', error);

                if (isMounted) {
                    setPostsError(error.message);
                }

            } finally {

                if (isMounted) {
                    setPostsLoading(false);
                }

            }
        }

        loadPosts();

        return () => {
            isMounted = false;
        };

    }, []);


    // Add a newly created post to the existing list
    function handlePostCreated(newPost) {

        setPosts(previousPosts => [
            newPost,
            ...previousPosts
        ]);

    }


    return (

        <BrowserRouter>

            {authLoading ? (

                <p className="loading-message">
                    Checking login status...
                </p>

            ) : (

                <Routes>

                    <Route
                        path="/"
                        element={
                            <HomePage
                                user={user}
                                posts={posts}
                                postsLoading={postsLoading}
                                postsError={postsError}
                                onPostCreated={handlePostCreated}
                            />
                        }
                    />

                    <Route
                        path="/signin"
                        element={
                            <SignIn onLogin={setUser} />
                        }
                    />

                    <Route
                        path="/signup"
                        element={<SignUp />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                </Routes>

            )}

        </BrowserRouter>

    );
}

export default App;

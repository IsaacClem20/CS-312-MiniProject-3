

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

import './App.css';

// Temporary homepage until we implement
// the actual blog post components in Step 6.
function HomePage({ user }) {
    return (
        <div className="app-shell">

            <h1>Isaac's Crazy Blog</h1>

            <p>Welcome to my blog!</p>
            <p>Please be respectful of others.</p>

            {user ? (
                <div>
                    <p>Signed in as {user.name}</p>
                    <p>Your account is successfully authenticated!</p>
                </div>
            ) : (
                <div className="home-links">
                    <Link to="/signin">Sign In</Link>
                    {' | '}
                    <Link to="/signup">Sign Up</Link>
                </div>
            )}

            <h2>Blog posts</h2>
            <p>Our React blog homepage will be implemented in Step 6.</p>

        </div>
    );
}


function App() {
    // Store the currently signed-in user
    const [user, setUser] = useState(null);

    // Check whether a session already exists
    const [authLoading, setAuthLoading] = useState(true);

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
                        element={<HomePage user={user} />}
                    />

                    <Route
                        path="/signin"
                        element={<SignIn onLogin={setUser} />}
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

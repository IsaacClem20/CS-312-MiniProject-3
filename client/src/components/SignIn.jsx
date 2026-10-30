
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function SignIn({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Store the signin form values
    const [formData, setFormData] = useState({
        user_id: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update state whenever a user types
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData(previousData => ({
            ...previousData,
            [name]: value
        }));
    }

    // Submit the signin form
    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signin failed.');
            }

            // Update the user's login information in React
            onLogin(data.user);

            // Return to the homepage
            navigate('/');

        } catch (error) {
            console.error('Signin error:', error);
            setError(error.message || 'Could not sign in.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Sign In</h1>

                {location.state?.message && (
                    <p className="form-success" role="status">
                        {location.state.message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>

                    <label htmlFor="user_id">User ID:</label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>

                </form>

                <p>
                    Don't have an account?{' '}
                    <Link to="/signup">Create one</Link>
                </p>

                <p>
                    <Link to="/">Back to the blog</Link>
                </p>

            </div>
        </div>
    );
}

export default SignIn;

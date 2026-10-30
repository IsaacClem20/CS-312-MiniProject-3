
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function SignUp() {
    const navigate = useNavigate();

    // Store the signup form values
    const [formData, setFormData] = useState({
        user_id: '',
        name: '',
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

    // Submit the signup form
    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed.');
            }

            // Account created successfully!
            // Navigate to the signin page.
            navigate('/signin', {
                state: {
                    message: data.message
                }
            });

        } catch (error) {
            console.error('Signup error:', error);
            setError(error.message || 'Could not create your account.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Create an Account</h1>

                <form onSubmit={handleSubmit}>

                    <label htmlFor="user_id">User ID:</label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleChange}
                        minLength={3}
                        maxLength={50}
                        required
                    />

                    <label htmlFor="name">Your Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={100}
                        required
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        required
                    />

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </button>

                </form>

                <p>
                    Already have an account?{' '}
                    <Link to="/signin">Sign in</Link>
                </p>

                <p>
                    <Link to="/">Back to the blog</Link>
                </p>

            </div>
        </div>
    );
}

export default SignUp;

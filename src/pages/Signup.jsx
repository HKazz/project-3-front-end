import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authContext } from "../context/AuthContext";
import "../pages-css/Signup.css";

function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signup, user, loading: authLoading } = useContext(authContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/projects")
        }
    }, [user, navigate])

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // Clear error when user types
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        const { confirmPassword, ...signupData } = formData;
        const result = await signup(signupData);
        
        if (result.success) {
            navigate("/login");
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    }

    if (authLoading) {
        return (
            <div className="signup-container">
                <div className="signup-card">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h1 className="signup-title">Create Account</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="signup-button"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;

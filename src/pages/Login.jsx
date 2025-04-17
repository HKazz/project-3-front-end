import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authContext } from '../context/AuthContext'
import axios from 'axios'
import "../pages-css/Login.css"

function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [apiStatus, setApiStatus] = useState("checking")

    const { login, user, loading: authLoading } = useContext(authContext)
    const navigate = useNavigate()

    useEffect(() => {
        // Test API connection
        const testApiConnection = async () => {
            try {
                const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
                console.log("Testing API connection to:", API_URL)
                const response = await axios.get(`${API_URL}/health`)
                console.log("API health check response:", response.data)
                setApiStatus("connected")
            } catch (err) {
                console.error("API connection error:", {
                    message: err.message,
                    status: err.response?.status,
                    url: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/health`
                })
                setApiStatus("error")
                setError("Cannot connect to the server. Please make sure the backend server is running.")
            }
        }

        testApiConnection()
    }, [])

    useEffect(() => {
        if (user) {
            navigate("/projects")
        }
    }, [user, navigate])

    function validateForm() {
        const errors = {}
        if (!formData.username.trim()) {
            errors.username = "Username is required"
        }
        if (!formData.password) {
            errors.password = "Password is required"
        }
        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    function handleChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear validation error when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: "" }))
        }
        setError("") // Clear general error when user types
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        if (apiStatus === "error") {
            setError("Cannot connect to the server. Please make sure the backend server is running.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const result = await login(formData)
            
            if (!result.success) {
                setError(result.error)
            }
        } catch (err) {
            console.error("Login error:", err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Welcome Back</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                {apiStatus === "checking" && (
                    <div className="info-message">Checking server connection...</div>
                )}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading || apiStatus === "error"}
                            required
                            autoComplete="username"
                            className={validationErrors.username ? "error" : ""}
                        />
                        {validationErrors.username && (
                            <span className="field-error">{validationErrors.username}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading || apiStatus === "error"}
                            required
                            autoComplete="current-password"
                            className={validationErrors.password ? "error" : ""}
                        />
                        {validationErrors.password && (
                            <span className="field-error">{validationErrors.password}</span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading || apiStatus === "error"}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="signup-link">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    )
}

export default Login

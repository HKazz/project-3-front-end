import { Link } from "react-router-dom"
import { useContext, useState } from "react"
import { authContext } from "../context/AuthContext"
import "./Navbar.css"

function Navbar() {
  const {user, logout} = useContext(authContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/projects" className="navbar-logo">
          Task Manager
        </Link>
        
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="navbar-toggle-icon"></span>
        </button>
        
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/projects" className="navbar-link">Projects</Link>
          </li>
          <li className="navbar-item">
            <Link to="/project/create" className="navbar-link">Create Project</Link>
          </li>
          {user && (
            <li className="navbar-item">
              <Link to="/team-members" className="navbar-link">Team Members</Link>
            </li>
          )}
          
          {user ? (
            <div className="navbar-user">
              <span className="navbar-username">
                <span className="welcome-text">Welcome,</span>
                <span className="username-text">{user.user.username}</span>
              </span>
              <button onClick={logout} className="navbar-button logout">Logout</button>
            </div>
          ) : (
            <>
              <li className="navbar-item">
                <Link to='/login' className="navbar-link">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to='/signup' className="navbar-link">Signup</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

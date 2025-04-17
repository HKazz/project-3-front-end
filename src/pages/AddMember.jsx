import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages-css/ProjectDetails.css';

function AddMember() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMember, setNewMember] = useState({
    email: '',
    fullName: '',
    role: '',
    notes: '',
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view project details');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProject(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project details:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this project.');
      } else if (error.response?.status === 404) {
        setError('Project not found.');
      } else {
        setError('Failed to load project details. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    setMemberError('');

    try {
      // First, find the user by email
      const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/by-email/${newMember.email}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!userResponse.data) {
        setMemberError('User not found with this email');
        setAddingMember(false);
        return;
      }

      // Prepare the member data according to the backend schema
      const memberData = {
        teamMembers: [{
          user: userResponse.data._id,
          name: newMember.fullName,
          part: newMember.role,
          note: newMember.notes,
          joinDate: newMember.joinDate
        }]
      };

      // Add the member to the project
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}/members`,
        memberData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data) {
        navigate(`/project/${projectId}`);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setMemberError('Invalid member data. Please check all fields.');
            break;
          case 401:
            setMemberError('Your session has expired. Please log in again.');
            break;
          case 403:
            setMemberError('You do not have permission to add members to this project.');
            break;
          case 404:
            setMemberError('Project or user not found.');
            break;
          case 409:
            setMemberError('This user is already a member of the project.');
            break;
          default:
            setMemberError('An error occurred while adding the member. Please try again.');
        }
      } else {
        setMemberError('Network error. Please check your connection and try again.');
      }
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading project details...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button 
          onClick={() => navigate('/projects')} 
          className="retry-button"
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-message">
        Project not found
        <button 
          onClick={() => navigate('/projects')} 
          className="retry-button"
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-details-container">
      <div className="project-header">
        <h1>Add Member to {project.projectName}</h1>
        <button 
          onClick={() => navigate(`/project/${projectId}`)}
          className="back-button"
        >
          Back to Project
        </button>
      </div>

      <div className="add-member-form">
        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={newMember.fullName}
              onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <input
              type="text"
              id="role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={newMember.notes}
              onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="joinDate">Join Date</label>
            <input
              type="date"
              id="joinDate"
              value={newMember.joinDate}
              onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
              required
            />
          </div>

          {memberError && <p className="error-message">{memberError}</p>}

          <button
            type="submit"
            className="submit-button"
            disabled={addingMember}
          >
            {addingMember ? 'Adding Member...' : 'Add Member'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMember; 
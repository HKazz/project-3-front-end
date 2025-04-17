import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages-css/TeamWorkDetails.css';

function TeamWorkDetails() {
  const { projectId } = useParams();
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to view project details");
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setProject(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project details:', error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view this project");
      } else if (error.response?.status === 404) {
        setError("Project not found");
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
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/by-email/${newMember.email}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

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
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/project/${projectId}/members`,
        memberData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Reset form and refresh project details
      setNewMember({
        email: '',
        fullName: '',
        role: '',
        notes: '',
        joinDate: new Date().toISOString().split('T')[0]
      });
      fetchProjectDetails();
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

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/project/${projectId}/members/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      fetchProjectDetails();
    } catch (error) {
      console.error('Error removing member:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            alert('Your session has expired. Please log in again.');
            break;
          case 403:
            alert('You do not have permission to remove members from this project.');
            break;
          case 404:
            alert('Project or member not found.');
            break;
          default:
            alert('An error occurred while removing the member. Please try again.');
        }
      } else {
        alert('Network error. Please check your connection and try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading team work details...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button 
          onClick={() => navigate('/projects')} 
          className="retry-button"
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
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const isProjectManager = project?.projectManager?.toString() === localStorage.getItem('userId');

  return (
    <div className="team-work-details-container">
      <div className="team-work-header">
        <h1>Team Work - {project.projectName}</h1>
        <button 
          onClick={() => navigate(`/project/${projectId}`)}
          className="back-button"
        >
          Back to Project
        </button>
      </div>

      <div className="team-work-content">
        <div className="members-section">
          <h2>Team Members</h2>
          <div className="members-list">
            {project?.teamMembers?.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.part}</p>
                  {member.note && <p className="member-notes">{member.note}</p>}
                  <p className="member-join-date">
                    Joined: {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
                {isProjectManager && (
                  <button
                    className="remove-member-button"
                    onClick={() => handleRemoveMember(member.user)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {isProjectManager && (
            <div className="add-member-section">
              <h3>Add New Member</h3>
              <form onSubmit={handleAddMember} className="add-member-form">
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name:</label>
                  <input
                    type="text"
                    id="fullName"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role:</label>
                  <input
                    type="text"
                    id="role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notes:</label>
                  <textarea
                    id="notes"
                    value={newMember.notes}
                    onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="joinDate">Join Date:</label>
                  <input
                    type="date"
                    id="joinDate"
                    value={newMember.joinDate}
                    onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                    required
                  />
                </div>
                {memberError && <div className="error-message">{memberError}</div>}
                <button 
                  type="submit" 
                  className="add-member-button"
                  disabled={addingMember}
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamWorkDetails; 
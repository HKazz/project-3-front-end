import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TeamMembers.css';

const TeamMembers = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    username: '',
    projectId: '',
    role: '',
    notes: '',
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Filter out projects without a name and sort by name
        const validProjects = response.data
          .filter(project => project.projectName)
          .sort((a, b) => a.projectName.localeCompare(b.projectName));
        setProjects(validProjects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Get unique team members across all projects
  const getAllTeamMembers = () => {
    const membersMap = new Map();
    
    projects.forEach(project => {
      project.teamMembers.forEach(member => {
        if (!membersMap.has(member.user._id)) {
          membersMap.set(member.user._id, {
            ...member.user,
            roles: [{
              projectId: project._id,
              projectName: project.projectName,
              role: member.role,
              joinDate: member.joinDate
            }]
          });
        } else {
          const existingMember = membersMap.get(member.user._id);
          existingMember.roles.push({
            projectId: project._id,
            projectName: project.projectName,
            role: member.role,
            joinDate: member.joinDate
          });
        }
      });
    });

    return Array.from(membersMap.values());
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    setMemberError(null);
    setError(null);
    setSuccess(null);

    try {
      // First, find the user by username
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/username/${newMember.username}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!userResponse.data) {
        setMemberError('User not found');
        setAddingMember(false);
        return;
      }

      // Prepare member data
      const memberData = {
        teamMembers: [{
          user: userResponse.data._id,
          name: userResponse.data.username,
          part: newMember.role,
          note: newMember.notes,
          joinDate: newMember.joinDate
        }]
      };

      // Add member to project
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/project/${newMember.projectId}/members`,
        memberData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh projects list
      const updatedProjects = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProjects(updatedProjects.data);

      // Reset form
      setNewMember({
        username: '',
        projectId: '',
        role: '',
        notes: '',
        joinDate: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setSuccess('Member added successfully');
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setMemberError('Invalid data provided');
            break;
          case 401:
            setMemberError('Session expired. Please login again');
            break;
          case 403:
            setMemberError('You do not have permission to add members to this project');
            break;
          case 404:
            setMemberError('User not found. Please check the username.');
            break;
          case 409:
            setMemberError('User is already a member of this project');
            break;
          default:
            setMemberError('Failed to add member. Please try again');
        }
      } else {
        setMemberError('Failed to add member. Please try again');
      }
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveClick = (projectId, memberId) => {
    setMemberToRemove({ projectId, memberId });
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    
    setRemovingMember(true);
    setRemoveError(null);

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/project/${memberToRemove.projectId}/${memberToRemove.memberId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh projects list
      const updatedProjects = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProjects(updatedProjects.data);
      setSuccess('Member removed successfully');
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setRemoveError('Session expired. Please login again');
            break;
          case 403:
            setRemoveError('You do not have permission to remove members from this project');
            break;
          case 404:
            setRemoveError('Project or member not found');
            break;
          default:
            setRemoveError('Failed to remove member. Please try again');
        }
      } else {
        setRemoveError('Failed to remove member. Please try again');
      }
    } finally {
      setRemovingMember(false);
      setShowConfirmModal(false);
      setMemberToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmModal(false);
    setMemberToRemove(null);
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  const teamMembers = getAllTeamMembers();

  return (
    <div className="team-members-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="team-members-header">
          <h1 className="team-members-title">Team Members</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="add-member-button"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Member to Project
          </button>
        </div>

        {showAddForm && (
          <div className="add-member-form">
            <div className="form-header">
              <h2 className="form-title">Add Member to Project</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="close-button"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={newMember.username}
                    onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                    className="form-input"
                    required
                    placeholder="Enter member's username"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select
                    value={newMember.projectId}
                    onChange={(e) => setNewMember({ ...newMember, projectId: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects && projects.length > 0 ? (
                      projects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.projectName || 'Unnamed Project'}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No projects available</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="form-input"
                    required
                    placeholder="e.g., Developer, Designer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Join Date</label>
                  <input
                    type="date"
                    value={newMember.joinDate}
                    onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  value={newMember.notes}
                  onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                  className="form-textarea"
                  rows="3"
                  placeholder="Additional information about the member's role or responsibilities"
                />
              </div>

              {memberError && (
                <div className="error-message">
                  <div className="error-content">
                    <svg className="error-icon h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="error-text">{memberError}</p>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="submit-button"
                >
                  {addingMember ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    'Add Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="members-grid">
          {teamMembers.map(member => (
            <div key={member._id} className="member-card">
              <div className="member-header">
                <h3>{member.username}</h3>
                <p className="member-email">{member.email}</p>
              </div>
              
              <div className="member-info">
                {member.roles.map((role, index) => (
                  <div key={index} className="info-item">
                    <span className="info-label">Project:</span>
                    <Link 
                      to={`/project/${role.projectId}`}
                      className="info-value"
                    >
                      {role.projectName}
                    </Link>
                    <span className="info-label">Role:</span>
                    <span className="info-value">{role.role}</span>
                    <span className="info-label">Joined:</span>
                    <span className="info-value">{new Date(role.joinDate).toLocaleDateString()}</span>
                    <div className="project-actions">
                      <button
                        className="remove-member-button"
                        onClick={() => handleRemoveClick(role.projectId, member._id)}
                        disabled={removingMember}
                      >
                        {removingMember ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-header">
              <h3>Remove Team Member</h3>
              <p>Are you sure you want to remove this member from the project? This action cannot be undone.</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-button cancel"
                onClick={handleCancelRemove}
                disabled={removingMember}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-button confirm"
                onClick={handleConfirmRemove}
                disabled={removingMember}
              >
                {removingMember ? 'Removing...' : 'Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers; 
import React, { useState, useEffect } from "react";
import AddMembersModal from "../AddingModal/AddMembersModal";
import { BASE_URL } from "../Configuration/Config";
import { useAuth } from "./AuthContext";

const ManageMembersModal = ({ onClose, companyId: propCompanyId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // Use prop companyId if provided, otherwise fallback to user context
  const companyId = propCompanyId || user?.company_id;

  // Fetch all members
  const fetchMembers = async () => {
    if (!companyId) {
      console.warn("companyId missing, cannot fetch members");
      setError("Company ID not found. Cannot fetch members.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/user/get_users_by_company/${companyId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API returns array directly, not {members: [...]}
      console.log("API Response:", data);
      setMembers(data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError("Unable to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("AuthContext user:", user);
    console.log("Derived Company ID:", companyId);

    if (companyId) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [user, companyId]);

  // Revoke/Remove member
  const handleRevoke = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.user_name}?`)) {
      return;
    }

    try {
      // Update this endpoint with your actual delete endpoint
      const response = await fetch(`${BASE_URL}/user/remove_member`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: member.user_id,
          company_id: companyId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchMembers(); // refresh list
    } catch (err) {
      console.error("Failed to revoke member:", err);
      alert("Failed to remove member. Please check the API endpoint.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <div
        className="theme-bg-card shadow-2xl rounded-2xl w-full h-full md:mx-6 md:my-6 md:p-6 p-4 overflow-hidden relative animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl theme-text-primary">Manage Members</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="rounded-xl theme-bg-card animate-slide-in-up overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-4 items-center px-4 py-2 theme-bg-primary theme-text-secondary text-sm font-medium">
                  <span className="text-center">Name</span>
                  <span className="text-center">Email</span>
                  <span className="text-center">Created At</span>
                  <span className="text-center">Action</span>
                </div>

                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No members found</p>
                  ) : (
                    members.map((member, idx) => (
                      <div
                        key={member.user_id || idx}
                        className="grid grid-cols-4 px-4 py-3 border-t theme-border theme-text-primary text-sm items-center hover:theme-bg-hover"
                      >
                        <span className="text-center overflow-auto whitespace-nowrap scrollbar-hidden px-2">{member.user_name || "—"}</span>
                        <span className="text-center overflow-auto whitespace-nowrap scrollbar-hidden px-2">{member.user_email || "—"}</span>
                        <span className="text-center whitespace-nowrap px-2">
                          {member.created_at
                            ? new Date(member.created_at).toLocaleDateString()
                            : "—"}
                        </span>
                        <div className="text-center">
                          <button
                            onClick={() => handleRevoke(member)}
                            className="text-red-500 hover:text-red-400 p-2 rounded transition-colors"
                            title="Remove Member"
                          >
                            {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg> */}
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mobile Card View - Compact Version */}
              <div className="sm:hidden">
                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-500">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.205a9 9 0 01-13.5 3.5" />
                    </svg>
                    <p className="text-base text-center">No members found</p>
                    <p className="text-sm opacity-75 mt-1 text-center">Invite members to get started</p>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                    {members.map((member, idx) => (
                      <div
                        key={member.user_id || idx}
                        className="border-y theme-border p-3 hover:theme-bg-hover transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Left side - Name and info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-blue-500">
                                  {(member.user_name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-sm overflow-auto theme-text-primary">
                                  {member.user_name || "Unnamed Member"}
                                </h3>
                              </div>
                            </div>

                            {/* Email */}
                            <p className="text-xs overflow-auto scrollbar-hidden theme-text-secondary" title={member.user_email}>
                              {member.user_email || "No email"}
                            </p>
                          </div>

                          {/* Right side - Actions and date */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleRevoke(member)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                              title="Remove Member"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {member.created_at
                                ? new Date(member.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Invite Button */}
        <div className="absolute bottom-4 right-4">
          {!showInvitePopup && (
            <button
              onClick={() => setShowInvitePopup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Send Invite
            </button>
          )}

          {showInvitePopup && (
            <div className="absolute bottom-14 right-0 animate-slide-in-up w-[26rem]">
              <AddMembersModal
                onClose={() => {
                  setShowInvitePopup(false);
                  fetchMembers(); // Refresh after adding
                }}
                companyId={companyId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;
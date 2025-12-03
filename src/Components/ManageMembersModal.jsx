import React, { useState, useEffect } from "react";
import axios from "axios";
import AddMembersModal from "../AddingModal/AddMembersModal";
import { BASE_URL } from "../Configuration/Config";

const ManageMembersModal = ({ onClose, companyId }) => {
    const [members, setMembers] = useState([]);
    const [showInvitePopup, setShowInvitePopup] = useState(false);
    const [error, setError] = useState("");

    // Fetch all members
    const fetchMembers = async () => {
        try {
            console.log("====Company ID====", companyId);
            const res = await axios.get(`${BASE_URL}/user/get_users_by_company/${companyId}`);
            setMembers(res.data.members || []);
        } catch (err) {
            console.error("Failed to fetch members:", err);
            setError("Unable to load members.");
        }
    };

    // Revoke member
    const handleRevoke = async (member) => {
        try {
            await axios.delete(`${BASE_URL}/user/get_users_by_company/${member.id}`);
            fetchMembers(); // refresh list
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={onClose}
        >
            <div
                className="theme-bg-card shadow-2xl rounded-2xl w-full h-full mx-6 my-6 p-6 overflow-hidden relative animate-slide-in-up"
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
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Table Header */}
                <div className="rounded-xl overflow-hidden theme-bg-card animate-slide-in-up">
                    <div className="grid grid-cols-4 items-center px-4 py-2 theme-bg-primary theme-text-secondary text-sm font-medium">
                        <span className="text-center">Name</span>
                        <span className="text-center">Email</span>
                        <span className="text-center">Role</span>
                        <span className="text-center">Action</span>
                    </div>

                    <div className="max-h-full overflow-y-auto">
                        {members.length === 0 ? (
                            <p className="text-center py-6 text-gray-500">No members found.</p>
                        ) : (
                            members.map((m, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-4 px-4 py-3 border-t theme-text-primary text-sm items-center"
                                >
                                    <span className="text-center">{m.user_name}</span>
                                    <span className="text-center">{m.user_email}</span>
                                    <span className="text-center">{m.role_name || "—"}</span>

                                    <button
                                        onClick={() => handleRevoke(m)}
                                        className="mx-auto text-red-500 hover:text-red-400"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Invite Button */}
                <div className="absolute bottom-4 right-4">
                    {!showInvitePopup && (
                        <button
                            onClick={() => setShowInvitePopup(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            Send Invite
                        </button>
                    )}

                    {showInvitePopup && (
                        <div className="absolute bottom-14 right-0 animate-slide-in-up w-[26rem]">
                            <AddMembersModal onClose={() => setShowInvitePopup(false)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageMembersModal;
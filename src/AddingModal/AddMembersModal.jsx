import React, { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../Configuration/Config";
import { useAuth } from "../Components/AuthContext";
import StatusMessageProvider, { useStatusMessage } from "../Alerts/StatusMessage";

const AddMembersModal = ({ onClose }) => {
    const [members, setMembers] = useState([
        { username: "", domain: "@gmail.com" },
    ]);

    const [domains, setDomains] = useState([
        "@gmail.com",
        "@hotmail.com",
        "@yahoo.com",
    ]);

    const [openDropdown, setOpenDropdown] = useState(null);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customDomain, setCustomDomain] = useState("");
    const [domainError, setDomainError] = useState("");
    const { authFetch } = useAuth();
    const { showMessage } = useStatusMessage();
    const [isSending, setIsSending] = useState(false);

    const [showDomainDropdown, setShowDomainDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close modal if clicked outside modal
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }

            // Close dropdown if clicked outside dropdown but inside modal
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                modalRef.current && modalRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const usernameRegex = /^[A-Za-z0-9]+$/;

    // Username (local-part) validation
    const handleUsernameChange = (index, value) => {
        if (value === "" || usernameRegex.test(value)) {
            const updated = [...members];
            updated[index].username = value;
            setMembers(updated);
        }
    };

    // Domain change
    const handleDomainChange = (index, value) => {
        const updated = [...members];
        updated[index].domain = value;
        setMembers(updated);
    };

    // Dropdown toggle
    const toggleDropdown = (index) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    // Select a domain from dropdown
    const selectDomain = (index, domain) => {
        handleDomainChange(index, domain);
        setOpenDropdown(null);
    };

    // Add new member row
    const addMemberField = () => {
        setMembers((prev) => [...prev, { username: "", domain: domains[0] }]);
    };

    // Remove member row
    const removeMemberField = (index) => {
        setMembers((prev) => prev.filter((_, i) => i !== index));
    };

    // Delete domain
    const deleteDomain = (dom) => {
        setDomains((prev) => prev.filter((d) => d !== dom));

        // Update any user using deleted domain
        setMembers((prev) =>
            prev.map((m) =>
                m.domain === dom ? { ...m, domain: domains[0] } : m
            )
        );
    };

    // Add custom domain
    const handleAddCustomDomain = () => {
        setDomainError("");

        const entry = customDomain.trim().toLowerCase();

        if (!entry.includes("@")) {
            setDomainError("Domain must contain '@'");
            return;
        }

        if (!entry.includes(".")) {
            setDomainError("Domain must contain a dot (.)");
            return;
        }

        if (domains.includes(entry)) {
            setDomainError("Domain already exists");
            return;
        }

        setDomains((prev) => [...prev, entry]);

        // Apply this domain to all empty new entries
        setMembers((prev) =>
            prev.map((m) =>
                m.domain === domains[0] ? { ...m, domain: entry } : m
            )
        );

        setCustomDomain("");
        setShowCustomInput(false);
    };

    // Final submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSending) return;  // prevent double-click

        setIsSending(true);

        const finalEmails = members.map((m) => m.username + m.domain);

        try {
            const response = await authFetch(`${BASE_URL}/invite/invite/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emails: finalEmails }),
            });

            const data = await response.json();
            console.log("API Response:", data);

            if (!response.ok) {
                throw new Error(data.error || "Failed to send invites");
            }

            showMessage("Invites sent successfully!", 'success');
            console.log("Invites sent successfully");

            onClose(); // close modal on success

        } catch (err) {
            showMessage(`Error: ${err.message}`, 'error');
            console.error("Invite error:", err.message);

        } finally {
            setIsSending(false); // re-enable button only after API completes
        }
    };



    return (
        <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                className="theme-bg-card shadow-2xl rounded-xl w-[30rem] max-w-[90vw] p-5 animate-slide-in-up absolute bottom-16 right-0 z-50"
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
            >
                <h2 className="text-xl theme-text-primary mb-2">Add Members</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Member Inputs */}
                    {members.map((member, index) => (
                        <div key={index} className="flex items-center gap-2">

                            <div className="flex w-full border border-gray-300 rounded-lg px-3 py-2 relative">
                                <input
                                    type="text"
                                    required
                                    value={member.username}
                                    onChange={(e) =>
                                        handleUsernameChange(index, e.target.value)
                                    }
                                    placeholder="username"
                                    className="flex-1 outline-none"
                                />

                                {/* Custom Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => toggleDropdown(index)}
                                        className="outline-none theme-text-secondary bg-transparent px-2"
                                    >
                                        {member.domain}
                                    </button>

                                    {openDropdown === index && (
                                        <div className="absolute right-0 top-full mt-1 w-48 theme-bg-card shadow-xl rounded-lg border z-50">

                                            {domains.map((dom) => (
                                                <div
                                                    key={dom}
                                                    className="flex justify-between items-center px-3 py-2 cursor-pointer"
                                                    onClick={() => selectDomain(index, dom)}
                                                >
                                                    <span>{dom}</span>

                                                    {/* Delete custom domains only */}
                                                    {!["@gmail.com", "@hotmail.com", "@yahoo.com"].includes(dom) && (
                                                        <button
                                                            className="text-red-500 text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteDomain(dom);
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Custom Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCustomInput(true);
                                                    setOpenDropdown(false);
                                                }}
                                                className="w-full text-left px-3 py-2 theme-bg-card border-t"
                                            >
                                                + Add custom domain
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Row */}
                            <button
                                type="button"
                                onClick={addMemberField}
                                className="p-2 rounded-lg theme-text-secondary"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" strokeWidth="1.5"
                                    stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>

                            {/* Remove Row */}
                            {members.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMemberField(index)}
                                    className="p-2 rounded-lg text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 24 24"
                                        strokeWidth="1.5" stroke="currentColor"
                                        className="w-6 h-6">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Custom Domain Input */}
                    {showCustomInput && (
                        <div className="animate-fadeIn border rounded-lg p-3 theme-bg-card">
                            <input
                                type="text"
                                placeholder="@example.com"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                className="border rounded-lg px-3 py-2 w-full"
                            />

                            {domainError && (
                                <p className="text-red-500 text-sm mt-1">{domainError}</p>
                            )}

                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomInput(false);
                                        setCustomDomain("");
                                        setDomainError("");
                                    }}
                                    className="px-4 py-1 text-gray-600 hover:text-gray-500"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddCustomDomain}
                                    className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-500"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSending}
                            className={`px-4 py-2 rounded-lg text-white ${isSending
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isSending ? "Sending…" : "Send Invite"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMembersModal;
import React, { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../Configuration/Config";
import { useAuth } from "../Components/AuthContext";
import StatusMessageProvider, { useStatusMessage } from "../Alerts/StatusMessage";
import { motion } from "framer-motion";

const AddMembersModal = ({ onClose }) => {
    const [members, setMembers] = useState([
        { username: "", domain: "@gmail.com" },
    ]);
    const [domains, setDomains] = useState([
        "@gmail.com",
        "@hotmail.com",
        "@yahoo.com",]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customDomain, setCustomDomain] = useState("");
    const [domainError, setDomainError] = useState("");
    const { authFetch } = useAuth();
    const { showMessage } = useStatusMessage();
    const [isSending, setIsSending] = useState(false);
    const [titleDropdownOpen, setTitleDropdownOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");

    const dropdownRef = useRef(null);
    const pcModalRef = useRef(null);
    const mobileModalRef = useRef(null);
    const titleDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedOutsidePC =
                pcModalRef.current &&
                !pcModalRef.current.contains(event.target) &&
                !event.target.closest('.role-dropdown-menu');

            const clickedOutsideMobile =
                mobileModalRef.current &&
                !mobileModalRef.current.contains(event.target) &&
                !event.target.closest('.role-dropdown-menu');

            // CLOSE ONLY IF:
            // - clicked outside PC modal when PC modal is active (screen ≥ sm)
            // - clicked outside Mobile modal when Mobile modal is active (screen < sm)
            if (window.innerWidth >= 640) {
                if (clickedOutsidePC) onClose();
            } else {
                if (clickedOutsideMobile) onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    //Select Roles
    const memberOptions = [
        "Architect",
        "Co-Admin",
        "Member",
        "Client"
    ];

    //Click Outside role dropdown
    // useEffect(() => {
    //     function handleClickOutside(e) {
    //         if (titleDropdownRef.current && !titleDropdownRef.current.contains(e.target)) {
    //             setTitleDropdownOpen(false);
    //         }
    //     }
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => document.removeEventListener("mousedown", handleClickOutside);
    // }, []);


    const emailLocalPartRegex = /^[a-zA-Z0-9._]+$/;

    const handleUsernameChange = (index, value) => {
        if (value === "" || emailLocalPartRegex.test(value)) {
            const updated = [...members];
            updated[index].username = value;
            setMembers(updated);
        }
    };

    const handleDomainChange = (index, value) => {
        const updated = [...members];
        updated[index].domain = value;
        setMembers(updated);
    };

    const toggleDropdown = (index) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    const selectDomain = (index, domain) => {
        handleDomainChange(index, domain);
        setOpenDropdown(null);
    };

    const addMemberField = () => {
        if (members.length >= 5) {
            showMessage("Maximum 5 members can be added at once", "message");
            return;
        }
        setMembers((prev) => [...prev, { username: "", domain: domains[0] }]);
    };

    const removeMemberField = (index) => {
        setMembers((prev) => prev.filter((_, i) => i !== index));
    };

    const deleteDomain = (dom) => {
        setDomains((prev) => prev.filter((d) => d !== dom));
        setMembers((prev) =>
            prev.map((m) => (m.domain === dom ? { ...m, domain: domains[0] } : m))
        );
    };

    const handleAddCustomDomain = () => {
        setDomainError("");

        const entry = customDomain.trim().toLowerCase();

        if (!entry.includes("@")) return setDomainError("Domain must contain '@'");
        if (!entry.includes(".")) return setDomainError("Domain must contain a dot (.)");
        if (domains.includes(entry)) return setDomainError("Domain already exists");

        setDomains((prev) => [...prev, entry]);

        setMembers((prev) =>
            prev.map((m) =>
                m.domain === domains[0] ? { ...m, domain: entry } : m
            )
        );

        setCustomDomain("");
        setShowCustomInput(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSending) return;

        if (!selectedRole || selectedRole.trim() === "") {
            showMessage("Please select a role for the members", "error");
            return;
        }
        setIsSending(true);

        const finalEmails = members.map((m) => m.username + m.domain);

        try {
            const response = await authFetch(`${BASE_URL}/invite/invite/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emails: finalEmails,
                    role_name: selectedRole
                }),
            });

            console.log('===========Role=========', selectedRole);

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to send invites");

            showMessage("Invites sent successfully!", "success");
            onClose();
        } catch (err) {
            showMessage(`Error: ${err.message}`, "error");
        } finally {
            setIsSending(false);
        }
    };

    /* TWO SEPARATE MODALS (PC & MOBILE) */
    return (
        <div
            className="fixed inset-0 bg-black/30 z-9999 flex p-4"
            onClick={onClose}
        >

            {/* PC / TABLET MODAL */}
            <div
                ref={pcModalRef}
                className="hidden sm:block theme-bg-card shadow-2xl rounded-xl p-4 absolute bottom-12 right-18 w-full max-w-md animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex items-center gap-3 mb-2 relative" ref={titleDropdownRef}>
                    <h2 className="text-xl theme-text-primary">Add Members</h2>

                    {/* Small Dropdown Button */}
                    <button
                        type="button"
                        onClick={() => setTitleDropdownOpen(!titleDropdownOpen)}
                        className="relative px-2 py-1 border border-gray-400 rounded-lg theme-text-secondary text-sm bg-transparent flex items-center gap-1"
                    >
                        {selectedRole || 'Select Role'}

                        <motion.svg
                            animate={{ rotate: titleDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                    </button>

                    {/* Dropdown Menu */}
                    {titleDropdownOpen && (
                        <div className="absolute right-30 top-full mt-1 w-40 theme-bg-card shadow-xl rounded-lg border z-50 bg-white role-dropdown-menu">
                            {memberOptions.map((item) => (
                                <div
                                    key={item}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                                    onClick={() => {
                                        console.log("Selected:", item);
                                        setSelectedRole(item);
                                        setTitleDropdownOpen(false);
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Member Inputs */}
                    {members.map((member, index) => (
                        <div
                            key={index}
                            className="hidden sm:flex items-center gap-3 w-full"
                        >
                            {/* Username Input – takes full width */}
                            <div className="flex flex-1 border border-gray-300 rounded-lg px-3 py-2">
                                <input
                                    type="text"
                                    required
                                    value={member.username}
                                    onChange={(e) => handleUsernameChange(index, e.target.value)}
                                    placeholder="user-mail"
                                    className="flex-1 outline-none"
                                />
                            </div>

                            {/* Domain — fixed natural width */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => toggleDropdown(index)}
                                    className="outline-none theme-text-secondary bg-transparent whitespace-nowrap"
                                >
                                    {member.domain}
                                </button>

                                {/* Dropdown */}
                                {openDropdown === index && (
                                    <div className="absolute h-30 right-0 top-full mt-1 w-48 theme-bg-card shadow-xl rounded-lg border z-50 overflow-y-auto whitespace-nowrap scrollbar-hidden">

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

                                        {/* Add custom domain */}
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

            {/* ---------------- MOBILE MODAL ---------------- */}
            <div
                ref={mobileModalRef}
                className="block sm:hidden theme-bg-card shadow-2xl rounded-xl p-2 w-full max-w-sm mx-auto animate-slide-in-up self-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex items-center gap-3 mb-2 relative"
                    ref={titleDropdownRef}
                >
                    <h2 className="text-xl theme-text-primary">Add Members</h2>

                    <button
                        type="button"
                        onClick={() => setTitleDropdownOpen(!titleDropdownOpen)}
                        className="px-2 py-1 border border-gray-400 rounded-lg theme-text-secondary text-sm bg-transparent flex items-center gap-1"
                    >
                        {selectedRole || 'Select Role'}

                        <motion.svg
                            animate={{ rotate: titleDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                    </button>

                    {titleDropdownOpen && (
                        <div className="absolute right-18 top-full mt-1 w-40 theme-bg-card shadow-xl rounded-lg border z-50">
                            {memberOptions.map(item => (
                                <div
                                    key={item}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                                    onClick={() => {
                                        console.log("Selected:", item);
                                        setSelectedRole(item);
                                        setTitleDropdownOpen(false);
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {members.map((member, index) => (
                        <div key={index}
                            className={`flex items-center w-full ${members.length === 1 ? "gap-1" : "gap-2"
                                }`}>

                            {/* Local part scrollable */}
                            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hidden">
                                <div className="inline-flex items-center border border-gray-300 rounded-lg px-3 py-2 w-max">
                                    <input
                                        type="text"
                                        required
                                        value={member.username}
                                        onChange={(e) => handleUsernameChange(index, e.target.value)}
                                        placeholder="user-mail"
                                        className="outline-none min-w-[120px]"
                                    />
                                </div>
                            </div>

                            {/* Domain compact on mobile */}
                            <div className="relative flex-shrink-0 max-w-[70px]" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => toggleDropdown(index)}
                                    className="outline-none theme-text-secondary bg-transparent px-2 truncate w-full text-left"
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

                            {/* Add Row */}
                            <button
                                type="button"
                                onClick={addMemberField}
                                className="p-2 flex-shrink-0 rounded-lg theme-text-secondary"
                            >
                                +
                            </button>

                            {/* Remove Row */}
                            {members.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMemberField(index)}
                                    className="p-2 flex-shrink-0 rounded-lg text-red-500"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Custom Domain */}
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
                                    className="px-4 py-1 text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddCustomDomain}
                                    className="px-4 py-1 bg-blue-600 text-white rounded-lg"
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
                            className="px-4 py-2 text-gray-600"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSending}
                            className={`px-4 py-2 rounded-lg text-white ${isSending
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600"
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
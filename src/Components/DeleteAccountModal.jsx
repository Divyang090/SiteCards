import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { BASE_URL } from "../Configuration/Config";

const DeleteAccountModal = ({ onClose }) => {
    const { user } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmationText, setConfirmationText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const modalRef = useRef(null);

    // Focus on password input when modal opens
    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.querySelector('input[type="password"]')?.focus();
        }
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    //check
    // Add this debug to your DeleteAccountModal
    // useEffect(() => {
    //     console.log("=== LOCALSTORAGE CONTENTS ===");
    //     console.log("accessToken:", localStorage.getItem("accessToken"));
    //     console.log("refreshToken:", localStorage.getItem("refreshToken"));
    //     console.log("user:", localStorage.getItem("user"));
    //     console.log("pendingLoginData:", localStorage.getItem("pendingLoginData"));
    //     console.log("============================");
    // }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // console.log("🔍 Debugging User Object:");
        // console.log("User from useAuth():", user);
        // console.log("LocalStorage user:", localStorage.getItem("user"));

        // Get user ID from the user object
        const userId = user?.user_id;

        if (!userId) {
            setError("Cannot find user ID. Please login again.");
            return;
        }

        console.log("Using user ID:", userId);

        // Validate confirmation text
        if (confirmationText.toLowerCase() !== "delete account") {
            setError("Please type 'delete account' exactly as shown to confirm.");
            return;
        }

        // Validate password
        if (!password.trim()) {
            setError("Please enter your password.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsDeleting(true);

        try {
            // Get the access token from localStorage
            const accessToken = localStorage.getItem("accessToken") ||
                localStorage.getItem("access_token") ||
                localStorage.getItem("jwt_token") ||
                "";

            console.log("🗑️ Deleting user with ID:", userId);
            console.log("Using token:", accessToken ? accessToken.substring(0, 20) + "..." : "No token");
            console.log("Password length:", password.length);

            // Make API call to delete user
            const response = await fetch(`http://127.0.0.1:5000/api/user/delete_user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken && { "Authorization": `Bearer ${accessToken}` }),
                },
                body: JSON.stringify({
                    user_password: password,
                    user_id: userId  // Add user_id in body for verification
                }),
            });

            console.log("Response status:", response.status);

            let errorData;
            try {
                errorData = await response.json();
                console.log("Response data:", errorData);
            } catch (parseError) {
                console.error("Failed to parse response as JSON");
                errorData = { message: "Server returned invalid JSON" };
            }

            if (!response.ok) {
                // Handle specific error messages from backend
                if (response.status === 401) {
                    throw new Error(errorData.message || "Invalid password or unauthorized access");
                } else if (response.status === 404) {
                    throw new Error("User not found");
                } else if (response.status === 400) {
                    throw new Error(errorData.message || "Invalid request");
                } else if (response.status === 500) {
                    // Get detailed error from backend
                    const errorMessage = errorData.message ||
                        errorData.error ||
                        errorData.detail ||
                        "Internal server error";
                    console.error("Backend error details:", errorData);
                    throw new Error(`Server error:`);
                    // ${errorMessage}
                } else {
                    throw new Error(errorData.message || `Failed to delete account (Status: ${response.status})`);
                }
            }

            // Success - account deleted
            console.log("✅ Account deletion successful:", errorData);

            // Show success message
            alert("Account deleted successfully. You will be logged out.");

            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();

            // Clear cookies
            document.cookie.split(";").forEach(cookie => {
                document.cookie = cookie
                    .replace(/^ +/, "")
                    .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
            });

            // Redirect to home page
            window.location.href = "/";

        } catch (err) {
            console.error("❌ Delete account error:", err);
            console.error("Error stack:", err.stack);
            setError(err.message || "Failed to delete account. Please try again.");

            // If it's a 500 error, suggest checking backend logs
            if (err.message.includes("500") || err.message.includes("Server error")) {
                setError(prev => prev + " Please try again later ");
                //Please check backend server logs for details.
            }
        } finally {
            setIsDeleting(false);
        }
    };


    const isFormValid =
        password.length >= 6 &&
        confirmationText.toLowerCase() === "delete account";

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-100"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="theme-bg-card shadow-2xl rounded-xl w-full max-w-md animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-3 pb-3 border-b theme-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-red-700">
                            Delete Account
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg transition-colors theme-text-secondary"
                            disabled={isDeleting}
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    {/* <p className="text-sm theme-text-secondary mt-1">
                        This action cannot be undone. All your data will be permanently deleted.
                    </p> */}
                </div>

                {/* Warning Banner */}
                <div className="p-4 bg-red-100 border-l-4 border-red-500 mx-4 mt-4 rounded-r">
                    <div className="flex items-start">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5 text-red-500 mr-2 mt-0.5 shrink-0"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-red-800">
                                Warning: Account Deletion
                            </p>
                            <p className="text-xs text-red-700 mt-0.5">
                                All projects, templates, and member data associated with this account will be permanently removed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-3 space-y-4">
                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium theme-text-primary mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }} onPaste={(e) => {
                                    e.preventDefault();
                                }} //no paste
                                onCopy={(e) => e.preventDefault()} //no copy
                                onCut={(e) => e.preventDefault()} //no cut
                                placeholder="Enter your password"
                                className="w-full border theme-border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                disabled={isDeleting}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isDeleting}
                            >
                                {passwordVisible ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirmation Text Input */}
                    <div>
                        <label className="block text-sm font-medium theme-text-primary mb-1">
                            Type confirmation text
                        </label>
                        <div className="mb-2 p-3 bg-gray-50 rounded-lg border theme-border">
                            <p className="text-lg font-mono text-red-600 text-center">
                                delete account
                            </p>
                        </div>
                        {/* <p className="text-xs text-gray-500 mb-1.5">
                            Please type <span className="font-mono">"delete account"</span> below to confirm deleting account
                        </p> */}
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => {
                                setConfirmationText(e.target.value);
                                setError("");
                            }}
                            onPaste={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            placeholder="Type 'delete account' here"
                            className="w-full border theme-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                            disabled={isDeleting}
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-4 h-4 mr-2 shrink-0"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Confirmation Checkbox */}
                    <div className="flex items-start space-x-2 p-3 bg-red-100 rounded-lg">
                        <input
                            type="checkbox"
                            id="confirmDelete"
                            //auto check when form valid
                            checked={isFormValid}
                            readOnly
                            className="mt-0.5 w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="confirmDelete" className="text-sm text-gray-700">
                            I understand that this action is{" "}
                            <span className="font-semibold text-red-600">permanent</span> and{" "}
                            <span className="font-semibold text-red-600">cannot be undone</span>.
                            All my data will be permanently deleted from the system.
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">

                        {/* CANCEL BUTTON */}
                        {/* <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button> */}

                        {/* DELETE ACCOUNT BUTTON */}
                        <button
                            type="submit"
                            disabled={!isFormValid || isDeleting}
                            className={`flex-1 py-2.5 px-4 text-sm font-medium text-white rounded-lg transition-colors ${!isFormValid || isDeleting
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {isDeleting ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Deleting...
                                </span>
                            ) : (
                                "Delete Account"
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Note */}
                <div className="px-3 pb-3 pt-2 bg-blue-50 rounded-b-lg border-t theme-border">
                    <p className="text-xs text-gray-800 text-center">
                        Need help? Contact support before proceeding.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
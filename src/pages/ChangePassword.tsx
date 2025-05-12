import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    // TODO: Implement password change logic here
    setSuccess("Password changed successfully (demo only).");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md p-8">
      <button
        className="mb-6 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => navigate("/account")}
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Account
      </button>
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-input p-2"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-input p-2"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-input p-2"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-recipe-primary w-full mt-4"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword; 
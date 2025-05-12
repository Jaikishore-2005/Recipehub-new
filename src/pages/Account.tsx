import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

const Account = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">You need to log in</h1>
        <p className="text-muted-foreground mb-8">
          Please log in to view your account
        </p>
        <button 
          onClick={() => navigate("/login")}
          className="btn-recipe-primary"
        >
          Log In
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl">
            {currentUser?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
            <p className="text-muted-foreground">{currentUser?.email}</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={currentUser?.name || ""}
                readOnly
                className="w-full rounded-md border border-input p-2 bg-muted/30"
              />
              <button className="ml-2 p-2 hover:bg-muted/50 rounded-md">
                <User size={16} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={currentUser?.email || ""}
              readOnly
              className="w-full rounded-md border border-input p-2 bg-muted/30"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-border p-6">
        <h3 className="font-medium mb-4">Account Actions</h3>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/change-password')}
            className="flex items-center justify-center gap-2 w-full py-2 btn-recipe-primary text-base"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 border border-destructive text-destructive hover:bg-destructive/5 rounded-md text-base"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;

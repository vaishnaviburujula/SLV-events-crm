import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Camera, User, Lock, Sparkles, CheckCircle } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('email', profileForm.email);
    formData.append('phone', profileForm.phone);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const res = await updateProfile(formData);
    setIsUpdatingProfile(false);

    if (res.success) {
      showToast('success', 'Profile updated successfully!');
      setAvatarFile(null);
    } else {
      showToast('error', res.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('warning', 'New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      showToast('success', 'Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      showToast('error', res.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Settings & Profile</h2>
        <p className="text-xs text-dark-400 mt-0.5">Manage your login credentials, profile, and account details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-card flex flex-col items-center text-center justify-center p-6 h-fit">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <img
              src={
                avatarPreview ||
                (user?.avatar
                  ? `http://localhost:5000${user.avatar}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=8b5cf6&color=fff`)
              }
              alt={user?.name}
              className="w-28 h-28 rounded-2xl object-cover border border-dark-800/80 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <h3 className="font-bold text-white text-base mt-4">{user?.name}</h3>
          <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[9px] font-extrabold uppercase rounded-md tracking-wider mt-1">
            {user?.role}
          </span>

          <div className="w-full text-xs text-left text-dark-400 space-y-2 mt-6 pt-4 border-t border-dark-850/60">
            <p>
              Status:{' '}
              <span className="text-emerald-400 font-bold flex items-center gap-1 inline-flex mt-0.5">
                <CheckCircle className="w-3 h-3" />
                <span>Active Employee</span>
              </span>
            </p>
            <p className="truncate">
              Email: <span className="text-dark-200 font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4 border-b border-dark-850 pb-2">
              <User className="w-4.5 h-4.5 text-brand-500" />
              <span>Personal Profile</span>
            </h4>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center gap-1.5"
                >
                  {isUpdatingProfile && (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          <div className="glass-card">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4 border-b border-dark-850 pb-2">
              <Lock className="w-4.5 h-4.5 text-brand-500" />
              <span>Update Password</span>
            </h4>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full glass-input"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full glass-input"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full glass-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center gap-1.5"
                >
                  {isUpdatingPassword && (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

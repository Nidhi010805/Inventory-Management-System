import React from 'react';
import UpdateProfileForm from '../components/UpdateProfileForm';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <UpdateProfileForm />
    </div>
  );
};

export default Settings;

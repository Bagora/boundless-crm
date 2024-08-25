'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { firestore } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({ fullname: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState({ fullname: true, role: true });
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setEditable({ fullname: !data.fullname, role: !data.role });
          setIsUpdated(data.fullname && data.role); 
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), profile);

      setIsUpdated(true);
      setEditable({ fullname: false, role: false });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 p-10 px-4 bg-slate-200 py-8">
      <div className="bg-white p-8 mt-8 rounded-3xl shadow-3xl py-6">
        <form onSubmit={handleUpdateProfile} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={profile.fullname}
            onChange={(e) => {
              setProfile({ ...profile, fullname: e.target.value });
              setIsUpdated(false); 
            }}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-rose-900"
            disabled={!editable.fullname}
          />
          <input
            type="text"
            value={user.email}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-rose-900"
            readOnly
          />
          <label className="block text-2xl text-left mb-2">Role</label>
          <select
            value={profile.role}
            onChange={(e) => {
              setProfile({ ...profile, role: e.target.value });
              setIsUpdated(false);
            }}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-rose-900"
            disabled={!editable.role}
          >
            <option value="" disabled>Select Role</option>
            <option value="admin">Admin</option>
            <option value="normal user">Normal User</option>
          </select>
          <button
            type="submit"
            className={`bg-gradient-to-r from-indigo-200 via-purple-400 to-rose-600 text-black px-6 py-2 rounded-lg shadow-3xl hover:from-rose-500 hover:to-orange-300 ${isUpdated ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isUpdated}
          >
            {isUpdated ? 'Profile Updated' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

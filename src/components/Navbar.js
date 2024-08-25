'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false); // Close the menu on logout
      router.push('/login');
    } catch (error) {
      console.error('Error during logout: ', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold hover:text-cyan-200" onClick={closeMenu}>
          Home
        </Link>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <div className={`hidden md:flex md:items-center md:space-x-4`}>
          <Link href="/dashboard" className="text-white hover:text-green-100 text-xl font-bold">
            Dashboard
          </Link>
          <Link href="/contacts" className="text-white hover:text-green-100 text-xl font-bold">
            Contacts
          </Link>
          <Link href="/profile" className="text-white hover:text-green-100 text-xl font-bold">
            Profile
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="text-white hover:text-green-100 text-xl font-bold"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="text-white hover:text-green-100 text-xl font-bold">
              Login
            </Link>
          )}
        </div>
      </div>
      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-4 mt-2 space-y-2 rounded-lg shadow-3xl">
          <Link href="/dashboard" className="block text-white text-xl font-bold py-2 hover:text-green-100" onClick={closeMenu}>
            Dashboard
          </Link>
          <Link href="/contacts" className="block text-white text-xl font-bold py-2 hover:text-green-100" onClick={closeMenu}>
            Contacts
          </Link>
          <Link href="/profile" className="block text-white text-xl font-bold py-2 hover:text-green-100" onClick={closeMenu}>
            Profile
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="block text-white text-xl font-bold py-2 hover:text-green-100 w-full text-left"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="block text-white text-xl font-bold py-2 hover:text-green-100" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

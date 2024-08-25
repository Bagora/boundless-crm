'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer'; // Import the Footer component

const ClientLayout = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page if the user is not authenticated and not on the login page
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, pathname, router]);

  // Check if the user is authenticated
  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show Navbar and Footer if the user is authenticated and not on the login page */}
      {isAuthenticated && pathname !== '/login' && <Navbar />}
      <main className="flex-grow container mx-auto">
        {/* Render children only if authenticated or on the login page */}
        {isAuthenticated || pathname === '/login' ? children : null}
      </main>
      {isAuthenticated && pathname !== '/login' && <Footer />}
    </div>
  );
};

export default ClientLayout;

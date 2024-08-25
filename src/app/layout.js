import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'CRM App',
  description: 'A simple Design complex functionality CRM app built with Next.js, Tailwind CSS, and Firebase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

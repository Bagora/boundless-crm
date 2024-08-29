Boundless CRM is a powerful yet user-friendly Customer Relationship Management (CRM) application designed for small to medium-sized businesses. Built with Next.js and Tailwind CSS, it offers a sleek and responsive interface. The app is powered by Firebase, ensuring secure authentication and robust data management.

Key Features:

Secure Authentication: Users can log in securely, with data stored safely in Firestore.
Dashboard: A comprehensive dashboard that displays critical metrics, including currency amounts (USD, Euro, GBP) across all sections.
Contact Management: Effortlessly create, view, and manage contacts. The app supports dynamic currency selection and amount input.
Profile Management: Users can update their profile once, with the button changing to "Profile Updated" afterward, ensuring a smooth user experience.
Notes and Attachments: Add notes with optional file attachments directly into Firestore.
Animations and UI/UX Enhancements: The app incorporates smooth animations using Framer Motion, including a 3D digital clock and flip animations, alongside a typewriter effect for taglines.
Simple Design, Complex Functionality: Despite its straightforward design, the app offers complex functionality to meet various business needs.
Connecting Firebase Database Using .env in Next.js
To securely connect your Firebase project with your Next.js application, you'll use environment variables stored in a .env.local file. Here's how:

1. Create a Firebase Project
    Go to the Firebase Console.
    Create a new project
    Go to Project Settings > General and find the Firebase SDK snippet. Choose the Config option.
2. Set Up Environment Variables
    In your Next.js project, create a .env file in the root directory.

Copy the Firebase config values from the Firebase console and add them to your .env file as follows:

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

Replace your-api-key, your-auth-domain, etc., with the actual values from your Firebase project.
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const companyName = 'Boundless CRM';
  const companyLink = 'https://boundlessweb.in';

  return (
    <footer className="bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% text-white text-bold text-center py-4 hover:text-green-100">
      <p>
        &copy; {currentYear} <a href={companyLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{companyName}</a>
      </p>
    </footer>
  );
};

export default Footer;

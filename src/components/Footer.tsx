import React from 'react';

const Footer: React.FC = () => {
  return (
     <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-auto bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <span className="mr-1">&copy; {new Date().getFullYear()} Built by</span>
        <a
          href="https://uspekhi.web.app"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="USPEKHI Web Design"
          className="hover:underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
        >
          USPEKHI
        </a>
        <div className="mt-2">
          <a 
            href="/privacy-policy.html" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline text-blue-600 dark:text-blue-400"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
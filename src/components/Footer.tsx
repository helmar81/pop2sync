import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 text-center text-slate-400 text-xs mt-auto relative z-10">
      <p>© {new Date().getFullYear()} PopSync  | Built by</p>
       <a
            href="https://uspekhi.web.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="USPEKHI Web Design"
            className="hover:underline text-blue-400 hover:text-blue-300 font-semibold m-auto p-8"
          >
            USPEKHI
          </a>

           <br />
              <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-200 m-auto pt-6">
                Privacy Policy
              </a>
    </footer>
  );
};

export default Footer;
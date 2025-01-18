import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-6">
            <a href="https://facebook.com/nesaranaeem" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
              <FaFacebook size={24} />
            </a>
            <a href="https://github.com/nesaranaeem" target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-200 hover:text-gray-600 transition-colors">
              <FaGithub size={24} />
            </a>
            <a href="https://instagram.com/nesaranaeem" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 transition-colors">
              <FaInstagram size={24} />
            </a>
            <a href="https://linkedin.com/in/nesaranaeem" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors">
              <FaLinkedin size={24} />
            </a>
          </div>
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="font-medium">
              &copy; {new Date().getFullYear()} Weather Station Dashboard
            </p>
            <p className="text-sm mt-1">
              Designed & Developed by <a href="https://nesaran.com" rel="nofollow" target="_blank" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Nesar Ahmed Naeem</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

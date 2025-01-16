export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-600 dark:text-gray-300">
          <p>
            &copy; {new Date().getFullYear()} Weather Station Dashboard. By
            Nesar
          </p>
        </div>
      </div>
    </footer>
  );
}

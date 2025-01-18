import { FaSpinner } from "react-icons/fa";

export default function LoadingSpinner({ size = "medium" }) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex justify-center items-center">
      <FaSpinner 
        className={`animate-spin text-blue-500 ${sizeClasses[size]}`} 
      />
    </div>
  );
}

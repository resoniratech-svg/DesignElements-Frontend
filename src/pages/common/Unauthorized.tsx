import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE_DASHBOARD_MAP } from "../../types/user";
import { ShieldOff } from "lucide-react";

export default function Unauthorized() {
  const { user } = useAuth();

  const dashboardPath = user
    ? ROLE_DASHBOARD_MAP[user.role]
    : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <ShieldOff size={36} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Access Denied
        </h1>

        <p className="text-gray-500 mb-8">
          You do not have permission to access this page. Please contact your
          administrator if you believe this is a mistake.
        </p>

        <Link
          to={dashboardPath}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

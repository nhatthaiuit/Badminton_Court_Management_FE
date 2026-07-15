import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      toast.success("Password has been reset successfully. You can now log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors && data.errors.length > 0) {
        toast.error(data.errors[0].msg);
      } else {
        toast.error(data?.message || "Failed to reset password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Invalid Link</h2>
          <p className="mt-2 text-gray-600">The password reset link is invalid or missing.</p>
          <button onClick={() => navigate("/login")} className="mt-4 text-primary-600 hover:text-primary-500 font-medium">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 transition-colors">
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

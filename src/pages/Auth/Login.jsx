import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/authApi";
import { CalendarDays, Lock, Mail, User, Phone } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotView, setIsForgotView] = useState(false);
  
  // Login State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to where user tried to go, or dynamically based on role
  const from = location.state?.from?.pathname;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const user = await login(phone, password);
    if (user) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Default routing based on role
        if (user.role === 'admin' || user.role === 'owner') {
          navigate("/dashboard", { replace: true });
        } else if (user.role === 'customer') {
          navigate("/portal", { replace: true });
        } else {
          navigate("/bookings", { replace: true });
        }
      }
    }
    
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regEmail.endsWith("@gmail.com")) {
      toast.error("Email must end with @gmail.com");
      return;
    }
    setIsSubmitting(true);

    try {
      // By default, backend authController sets role="customer"
      await authApi.register({
        full_name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      });
      toast.success("Account created! Logging you in...");
      // Auto login after register
      await login(regPhone, regPassword);
      navigate("/portal", { replace: true });
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors && data.errors.length > 0) {
        toast.error(data.errors[0].msg);
      } else {
        toast.error(data?.message || "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(phone);
      toast.success("Password reset link sent to your email!");
      setIsForgotView(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center -mt-8 mb-4">
          <img src="/logo2.png" alt="BCMS Logo" className="h-48 w-48 object-contain drop-shadow-xl animate-in zoom-in duration-500 hover:scale-105 transition-transform" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLoginView ? "Sign in to BCMS" : "Create Customer Account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Badminton Court Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {/* Tabs */}
          {!isForgotView && (
            <div className="flex mb-6 border-b border-gray-200">
              <button 
                className={`flex-1 pb-3 font-medium text-sm border-b-2 transition-colors ${isLoginView ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                onClick={() => setIsLoginView(true)}
              >
                Sign In
              </button>
              <button 
                className={`flex-1 pb-3 font-medium text-sm border-b-2 transition-colors ${!isLoginView ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                onClick={() => setIsLoginView(false)}
              >
                Register
              </button>
            </div>
          )}

          {isForgotView ? (
            // FORGOT PASSWORD FORM
            <form className="space-y-6" onSubmit={handleForgotSubmit}>
              <div className="text-sm text-gray-600 text-center mb-4">
                Enter your phone number and we'll send a reset link to your email.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="0901234567" />
                </div>
              </div>
              <div>
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setIsForgotView(false)} className="text-sm text-primary-600 hover:text-primary-500">Back to Login</button>
              </div>
            </form>
          ) : isLoginView ? (
            // LOGIN FORM
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="0901234567" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="••••••••" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button type="button" onClick={() => setIsForgotView(true)} className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 transition-colors">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          ) : (
            // REGISTER FORM
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="you@gmail.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="0901234567" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="••••••••" />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 transition-colors">
                  {isSubmitting ? "Creating Account..." : "Register"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;

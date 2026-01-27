import React, { useState } from "react";
import JJRLogo from "../../assets/JJR.png";

const STATIC_CREDENTIALS = {
  username: "admin@example.com",
  password: "admin123",
};

export default function Loginpage({ onLoginSuccess })  {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Register state
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerErrors, setRegisterErrors] = useState({ email: "", password: "", confirm: "" });
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Login handler
  const handleLogin = async (e) => {
  e.preventDefault();
  const errors = { email: "", password: "" };

  if (!loginEmail) errors.email = "Email is required";
  else if (!validateEmail(loginEmail))
    errors.email = "Enter a valid email address";
  if (!loginPassword) errors.password = "Password is required";
  else if (loginPassword.length < 6)
    errors.password = "Password must be at least 6 characters";

  if (errors.email || errors.password) {
    setLoginErrors(errors);
    return;
  }

  setLoading(true);
  
  try {
    const response = await fetch(
      `http://192.168.0.142:8082/api/auth/admin/login?email=${encodeURIComponent(loginEmail)}&password=${encodeURIComponent(loginPassword)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("adminEmail", loginEmail);
      setLoginSuccess(true);
      setLoginErrors({ email: "", password: "" });
      
      setTimeout(() => {
        setLoginSuccess(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 1200);
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.error('Login error:', error);
    setLoginErrors({
      email: "Invalid credentials",
      password: "Invalid credentials",
    });
    setLoginSuccess(false);
  } finally {
    setLoading(false);
  }
};

  // Register handler
  const handleRegister = (e) => {
    e.preventDefault();
    const errors = { email: "", password: "", confirm: "" };

    if (!registerEmail) errors.email = "Email is required";
    else if (!validateEmail(registerEmail))
      errors.email = "Enter a valid email address";
    if (!registerPassword) errors.password = "Password is required";
    else if (registerPassword.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!registerConfirmPassword) errors.confirm = "Confirm your password";
    else if (registerPassword !== registerConfirmPassword)
      errors.confirm = "Passwords do not match";

    if (errors.email || errors.password || errors.confirm) {
      setRegisterErrors(errors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setRegisterSuccess(true);
      setRegisterErrors({ email: "", password: "", confirm: "" });
      setTimeout(() => {
        setRegisterSuccess(false);
        setShowRegister(false);
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterConfirmPassword("");
      }, 1200);
      setLoading(false);
    }, 800);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-emerald-950 bg-opacity-50 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md bg-[#fcfaf7] rounded-2xl shadow-2xl p-8 border border-stone-200">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-25 w-30 rounded-full flex items-center justify-center">
              <img src={JJRLogo} alt="JJR Logo" className="h-20 w-auto" />
            </div>
          </div>
          {/*<h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">JJROrganics</h2>*/}
          <p className="text-stone-500 font-medium">{showRegister ? "Create your admin account" : "Admin Dashboard Access"}</p>
        </div>

        {/* Login Form */}
        {!showRegister && (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1 tracking-wide">EMAIL ADDRESS</label>
              <div className="relative">
                <input
                  type="email"
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-stone-800 placeholder-stone-400 focus:outline-none transition-all duration-300
                    ${loginErrors.email 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  placeholder="admin@organicharvest.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
              {loginErrors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium flex items-center">
                  <span>• {loginErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1 tracking-wide">PASSWORD</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-stone-800 placeholder-stone-400 focus:outline-none transition-all duration-300
                    ${loginErrors.password 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 text-stone-400 hover:text-emerald-600 transition-colors"
                  style={{ transform: "translateY(-50%)" }}
                  onClick={() => setShowLoginPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showLoginPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.121-2.121A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938m-2.121-2.121A9.956 9.956 0 012 9c0-5.523 4.477-10 10-10a9.956 9.956 0 014.675.938" />
                    </svg>
                  )}
                </button>
              </div>
              {loginErrors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium flex items-center">
                   <span>• {loginErrors.password}</span>
                </p>
              )}
            </div>

            {/* Register & Forgot Password Row */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="text-emerald-600 text-sm font-semibold hover:text-emerald-800 hover:underline transition-colors"
                tabIndex={-1}
                disabled={loading}
                onClick={() => setShowRegister(true)}
              >
                Register now
              </button>
              <button
                type="button"
                className="text-emerald-600 text-sm font-semibold hover:text-emerald-800 hover:underline transition-colors"
                tabIndex={-1}
                disabled={loading}
                onClick={() => alert("Forgot password is not implemented in this demo.")}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded-lg font-bold text-white tracking-wide shadow-lg
                bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700
                transform active:scale-[0.98] transition-all duration-200
                ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "SIGN IN TO DASHBOARD"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {showRegister && (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1 tracking-wide">EMAIL ADDRESS</label>
              <div className="relative">
                <input
                  type="email"
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-stone-800 placeholder-stone-400 focus:outline-none transition-all duration-300
                    ${registerErrors.email 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  placeholder="your@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
              {registerErrors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium flex items-center">
                  <span>• {registerErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1 tracking-wide">PASSWORD</label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-stone-800 placeholder-stone-400 focus:outline-none transition-all duration-300
                    ${registerErrors.password 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 text-stone-400 hover:text-emerald-600 transition-colors"
                  style={{ transform: "translateY(-50%)" }}
                  onClick={() => setShowRegisterPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showRegisterPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.121-2.121A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938m-2.121-2.121A9.956 9.956 0 012 9c0-5.523 4.477-10 10-10a9.956 9.956 0 014.675.938" />
                    </svg>
                  )}
                </button>
              </div>
              {registerErrors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium flex items-center">
                   <span>• {registerErrors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1 tracking-wide">CONFIRM PASSWORD</label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-stone-800 placeholder-stone-400 focus:outline-none transition-all duration-300
                    ${registerErrors.confirm 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  placeholder="Re-enter your password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              {registerErrors.confirm && (
                <p className="text-red-500 text-xs mt-1 font-medium flex items-center">
                   <span>• {registerErrors.confirm}</span>
                </p>
              )}
            </div>

            {/* Register & Back to Login Row */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="text-emerald-600 text-sm font-semibold hover:text-emerald-800 hover:underline transition-colors"
                tabIndex={-1}
                disabled={loading}
                onClick={() => setShowRegister(false)}
              >
                Back to Login
              </button>
              <span></span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded-lg font-bold text-white tracking-wide shadow-lg
                bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700
                transform active:scale-[0.98] transition-all duration-200
                ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "REGISTER"}
            </button>
          </form>
        )}

        {/* Footer Text */}
        <div className="mt-8 text-center text-xs text-stone-400">
          &copy; {new Date().getFullYear()} JJROrganics Co. • Farm Fresh Quality
        </div>

        {/* Success Message */}
        {loginSuccess && (
          <div className="absolute inset-0 bg-emerald-50 bg-opacity-95 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Welcome Back!</h3>
            <p className="text-stone-600">Redirecting to the fields...</p>
          </div>
        )}
        {registerSuccess && (
          <div className="absolute inset-0 bg-emerald-50 bg-opacity-95 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Registration Successful!</h3>
            <p className="text-stone-600">You can now login with your new account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
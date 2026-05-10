import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { signInWithGoogle, auth, loginWithEmail } from '@/services/firebase';
import { signOut, getRedirectResult } from 'firebase/auth';
import { LogIn, Shield, Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect login success:', result.user.email);
          toast.success("Successfully logged in via redirect!");
        }
      } catch (error: any) {
        if (error.code !== 'auth/redirect-cancelled-by-user') {
          console.error('Redirect login error:', error);
          toast.error(`Login failed: ${error.message}`);
        }
      }
    };
    handleRedirect();
  }, []);

  const handleGoogleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result) {
        console.log('Login success:', result.user.email);
        toast.success("Successfully logged in!");
      }
    } catch (error: any) {
      console.error('Detailed login error:', error);
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request' &&
          error.code !== 'auth/redirect-cancelled-by-user') {
        toast.error(`Login failed: ${error.message || 'Unknown error'}`);
      }
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;

    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      toast.success("Welcome back!");
    } catch (error: any) {
      // Standard Firebase auth error handling
      const isCredentialError = error.code === 'auth/invalid-credential' || 
                               error.code === 'auth/user-not-found' || 
                               error.code === 'auth/wrong-password';
      
      if (!isCredentialError) {
        console.error('Unexpected email login error:', error);
      }
      
      const messageHeader = `Security Alert`;
      let message = "The identity credentials provided do not match our records.";
      
      // auth/invalid-credential is the modern Firebase error for both wrong password and user not found
      if (error.code === 'auth/invalid-credential') {
        message = "Invalid email or password. Please verify your credentials. If you are new, you must create an account first.";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password. Please try again or reset it.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later or reset your password.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Email/Password login is currently disabled for this project.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (error.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        const isIframe = window.self !== window.top;
        message = `Access Denied: The domain '${hostname}' is not authorized.`;
        toast.error("Unauthorized Domain", {
          description: `Please add '${hostname}' to your Firebase console > Authentication > Settings > Authorized domains.`,
          action: {
            label: "Copy Domain",
            onClick: () => {
              navigator.clipboard.writeText(hostname);
              toast.success("Domain copied to clipboard!");
            }
          }
        });
      } else if (error.code === 'auth/api-key-not-valid') {
        message = "Verification failed: The API Key is restricted. Please go to Google Cloud Console > Credentials and allow your Vercel domain.";
      }
      
      toast.error(message, { 
        description: `Code: ${error.code} | ${error.message}`,
        duration: 8000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="h-44 bg-gradient-to-br from-indigo-600 to-cyan-500 flex flex-col items-center justify-center p-6 text-white relative">
            <div className="relative z-10 p-4 bg-white/10 rounded-2xl backdrop-blur-md mb-3 border border-white/20 shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase relative z-10">M & Network</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 relative z-10">ISP Billing Management</p>
            
            {/* Abstract decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/20 rounded-full -ml-12 -mb-12 blur-2xl" />
          </div>
          
          <CardHeader className="text-center pt-8 pb-4 px-6 sm:px-10">
            <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 leading-none">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 sm:px-10 pb-8 pt-0">
            <form onSubmit={handleEmailLogin} className="space-y-5 mb-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern pl-11 h-12 border-slate-200 focus:border-indigo-600 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-[10px] text-indigo-600 font-bold hover:underline transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern pl-11 h-12 border-slate-200 focus:border-indigo-600 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-3 font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                Sign In with Email
              </Button>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest leading-none">
                <span className="bg-white px-4 text-slate-300">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 rounded-xl gap-3 font-bold text-[10px] uppercase tracking-widest border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </Button>

            <div className="mt-8 text-center bg-slate-50 py-4 -mx-6 sm:-mx-10 border-t border-slate-100">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-3">
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-600 hover:underline font-extrabold ml-1 uppercase">
                  Create Account
                </Link>
              </p>
              <button 
                type="button"
                onClick={() => {
                  toast.info("Authentication Diagnostics", {
                    description: `Current Domain: ${window.location.hostname}\nEnsure this is in Firebase > Auth > Settings > Authorized Domains`,
                    duration: 10000,
                    action: {
                      label: "Copy Domain",
                      onClick: () => {
                        navigator.clipboard.writeText(window.location.hostname);
                        toast.success("Domain copied!");
                      }
                    }
                  });
                }}
                className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold uppercase tracking-[0.1em] transition-colors bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mt-2 inline-block"
              >
                Troubleshoot Auth Connection
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

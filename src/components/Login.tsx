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
    if (!email || !password || loading) return;

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success("Welcome back!");
    } catch (error: any) {
      console.error('Email login error:', error);
      
      let message = "Login failed. Please check your credentials.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = "Incorrect email or password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Email/Password login is disabled. Please enable it in the Firebase Console (Authentication > Sign-in method).";
      } else if (error.code === 'auth/invalid-email') {
        message = "The email address is invalid.";
      }
      
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md sm:max-w-sm lg:max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex flex-col items-center justify-center p-6 text-white">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md mb-2">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ISP Portal</h1>
          </div>
          
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500">Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 sm:px-8 pb-8 pt-0">
            <form onSubmit={handleEmailLogin} className="space-y-5 mb-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-2xl transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-2xl transition-all"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] hover:opacity-90 text-white gap-2 font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                Sign In
              </Button>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-slate-400 font-medium uppercase tracking-wider">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 rounded-2xl gap-3 font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <div className="mt-10 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline transition-all">
                  Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </div>
      </motion.div>
    </div>
  );
}

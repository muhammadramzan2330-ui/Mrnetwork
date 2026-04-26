import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { signInWithGoogle, auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import { LogIn, Shield, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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
      // Don't show toast for user-initiated cancellations or redirects
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request' &&
          error.code !== 'auth/redirect-cancelled-by-user') {
        toast.error(`Login failed: ${error.message || 'Unknown error'}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-bold text-slate-900">ISP Admin Panel</CardTitle>
            <CardDescription>Secure access for network administrators</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 gap-3 text-lg font-medium"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? 'Connecting...' : 'Sign in with Google'}
            </Button>
            <p className="mt-6 text-center text-slate-400 text-xs">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

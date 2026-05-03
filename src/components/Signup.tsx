import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { registerWithEmail, createUserProfile } from '@/services/firebase';
import { UserPlus, Shield, Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || loading) return;

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerWithEmail(email, password);
      
      if (result.user) {
        // Create customer profile with explicit fields as requested
        await createUserProfile(result.user.uid, {
          name,
          email: result.user.email,
          phone,
          role: 'customer',
          status: 'pending',
        });
        toast.success("Account created. Please wait for admin approval.", { duration: 5000 });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Signup error caught:', error);
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);
      
      let message = error.message || "Signup failed. Please try again.";
      
      if (error.code === 'auth/operation-not-allowed') {
        message = `Email/Password sign-up is not allowed for this project. 
        Important: Please ensure 'Email/Password' is enabled in the Firebase Console and that you are looking at the CORRECT project ID.`;
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Try logging in instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "Your password is too weak. Please use at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        message = "The email address is invalid.";
      }
      
      toast.error(`Registration Error: ${message}`, { duration: 10000 });
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
            <h1 className="text-xl font-bold tracking-tight">Create Account</h1>
          </div>

          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">Join Us</CardTitle>
            <CardDescription className="text-slate-500">Sign up for an ISP account</CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-8 pt-0">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-700 font-medium ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-2xl transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-700 font-medium ml-1">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="phone"
                    type="tel" 
                    placeholder="+92 300 0000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-2xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 font-medium ml-1">Password</Label>
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
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] hover:opacity-90 text-white gap-2 font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Sign Up
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/" className="text-primary font-bold hover:underline transition-all">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </div>
      </motion.div>
    </div>
  );
}

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
    if (!email.trim() || !password || !name || loading) return;

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerWithEmail(email.trim(), password);
      
      if (result.user) {
        // Auto-admin for the developer or first users to avoid getting "stuck"
        const isDeveloper = email.trim().toLowerCase() === 'muhammadramzan2330@gmail.com';
        
        // Create customer profile with explicit fields as requested
        await createUserProfile(result.user.uid, {
          name,
          email: result.user.email,
          phone,
          role: isDeveloper ? 'admin' : 'customer',
          status: isDeveloper ? 'active' : 'pending',
          plan: "",
          paymentStatus: "pending"
        });
        
        if (isDeveloper) {
          toast.success("Developer Access Granted. Welcome, Commander.", { duration: 5000 });
        } else {
          toast.success("Identity registration complete. Awaiting HQ approval.", { duration: 5000 });
        }
        navigate('/');
      }
    } catch (error: any) {
      console.error('Signup error caught:', error);
      console.log('Current Project ID:', "isp-billing-app-eda7c");
      console.log('Auth Error Code:', error.code);
      
      let message = error.message || "Signup failed. Please try again.";
      
      if (error.code === 'auth/operation-not-allowed') {
        message = `Email/Password sign-up is not allowed for this project. 
        Important: Please ensure 'Email/Password' is enabled in the Firebase Console and that you are looking at the CORRECT project ID.`;
      } else if (error.code === 'auth/unauthorized-domain') {
        message = `This domain (${window.location.hostname}) is not authorized. Go to Firebase Console > Authentication > Settings > Authorized domains and add this URL.`;
      } else if (error.code === 'auth/api-key-not-valid') {
        message = "Verification failed: The API Key is restricted. Please go to Google Cloud Console > Credentials and allow your Vercel domain.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Try logging in instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "Your password is too weak. Please use at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        message = "The email address is invalid.";
      }
      
      toast.error(`Registration Error: ${message}`, { 
        description: `Code: ${error.code} | Host: ${window.location.hostname}`,
        duration: 10000 
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-indigo-600 to-cyan-500 flex flex-col items-center justify-center p-6 text-white relative">
            <div className="relative z-10 p-4 bg-white/10 rounded-2xl backdrop-blur-md mb-2 border border-white/20 shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase relative z-10">M & Network</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 relative z-10">ISP Billing Management</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          </div>

          <CardHeader className="text-center pt-8 pb-4 px-6 sm:px-10">
            <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Create Customer Account</CardTitle>
            <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 leading-none">Enter your details to get started</CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-8 pt-0">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-modern pl-11 h-12 border-slate-200 focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern pl-11 h-12 border-slate-200 focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    id="phone"
                    type="tel" 
                    placeholder="+92 3XX XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-modern pl-11 h-12 border-slate-200 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern pl-11 h-12 border-slate-200 focus:border-indigo-600"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-3 font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 mt-4 active:scale-[0.98] transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Create Account
              </Button>
            </form>

            <div className="mt-8 text-center bg-slate-50 py-6 -mx-6 sm:-mx-10 border-t border-slate-100 flex flex-col items-center gap-3">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                Already have an account?{' '}
                <Link to="/" className="text-indigo-600 hover:underline font-extrabold ml-1 uppercase">
                  Back to Login
                </Link>
              </p>
              <div className="flex flex-col items-center gap-2 mt-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Connection Issues?</p>
                <button 
                  type="button"
                  onClick={() => {
                    const hostname = window.location.hostname;
                    const isIframe = window.self !== window.top;
                    toast.info("Authentication Diagnostics", {
                      description: `Domain: ${hostname}\nMode: ${isIframe ? 'Iframe (Preview)' : 'Standard'}\nProject: isp-billing-app-eda7c`,
                      duration: 15000,
                      action: {
                        label: "Copy Info",
                        onClick: () => {
                          navigator.clipboard.writeText(`Domain: ${hostname}\nProject: isp-billing-app-eda7c`);
                          toast.success("Info copied!");
                        }
                      }
                    });
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-[0.1em] transition-colors bg-white px-5 py-2 rounded-xl border border-indigo-100 shadow-sm inline-flex items-center gap-2"
                >
                  <Shield className="w-3 h-3" />
                  Troubleshoot Connection
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

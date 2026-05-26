import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { resetPassword } from '@/services/firebase';
import { Shield, Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || loading) return;

    setLoading(true);
    try {
      await resetPassword(cleanEmail, window.location.origin);
      setSubmitted(true);
      toast.success("Password reset email sent", {
        description: "Please check your inbox and spam folder.",
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      let message = "If this email is registered, a reset link will be sent.";
      if (error.code === 'auth/invalid-email') {
        message = "Invalid email format.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many reset requests. Please try again later.";
      } else if (error.code === 'auth/user-not-found') {
        setSubmitted(true);
        toast.success("Password reset email sent", {
          description: "If this email is registered, you will receive a reset link.",
        });
        return;
      }
      toast.error(message);
    } finally {
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
          <div className="h-44 header-gradient flex flex-col items-center justify-center p-6 text-white relative">
            <div className="relative z-10 p-4 bg-white/10 rounded-2xl backdrop-blur-md mb-3 border border-white/20 shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase relative z-10">M & Network</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 relative z-10">ISP Billing Management</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          </div>
          
          {!submitted ? (
            <>
              <CardHeader className="text-center pt-8 pb-4 px-6 sm:px-10">
                <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Forgot Password</CardTitle>
                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 leading-relaxed">Enter your registered email to receive a secure reset link</CardDescription>
              </CardHeader>
              <CardContent className="px-6 sm:px-10 pb-8 pt-0">
                <form onSubmit={handleResetPassword} className="space-y-6 mb-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-modern pl-11 h-12 border-slate-200 focus:border-indigo-600"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:underline transition-all group">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                  </Link>
                </div>

                <div className="mt-8 text-center bg-slate-50 py-6 -mx-6 sm:-mx-10 border-t border-slate-100 flex flex-col items-center gap-3">
                  <div className="flex flex-col items-center gap-2">
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
            </>
          ) : (
            <CardContent className="px-8 py-12 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight uppercase">Email Sent</h3>
              <p className="text-slate-400 mb-8 text-[10px] font-bold uppercase tracking-widest leading-relaxed px-4">
                We've sent a password reset link to your email address.
                Please check inbox and spam folder.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200"
              >
                Back to Login
              </Button>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

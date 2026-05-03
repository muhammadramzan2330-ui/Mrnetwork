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
    if (!email || loading) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
      toast.success("Reset link sent!");
    } catch (error: any) {
      console.error('Reset password error:', error);
      let message = "Failed to send reset link.";
      if (error.code === 'auth/user-not-found') {
        message = "No account found with this email.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Invalid email format.";
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
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <div className="h-32 bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center relative overflow-hidden">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md relative z-10 shadow-xl border border-white/10 group animate-in fade-in zoom-in duration-500">
              <Shield className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          </div>
          
          {!submitted ? (
            <>
              <CardHeader className="text-center pt-8 px-8">
                <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">Recover Account</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Enter your digital contact for recovery.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleResetPassword} className="space-y-6 mb-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="master@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-100 font-bold text-slate-700 shadow-sm focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white gap-2 font-bold text-base shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Transmit Link"}
                  </Button>
                </form>

                <div className="text-center">
                  <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:underline py-2 transition-all hover:gap-3">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Terminal
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-sm shadow-emerald-100 transition-transform hover:rotate-12">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Transmission Sent</h3>
              <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed px-2">
                We've sent a tactical recovery link to <strong className="text-slate-800">{email}</strong>.
              </p>
              <Button onClick={() => navigate('/')} className="w-full h-14 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-base shadow-lg transition-all active:scale-[0.98]">
                Return to Login
              </Button>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

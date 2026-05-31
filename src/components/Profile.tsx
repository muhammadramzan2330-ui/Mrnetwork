import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPasswordChecks, validateStrongPassword } from '@/lib/security';
import { updateDocument } from '@/services/firebase';

export default function UserProfile() {
  const { profile, loading, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.name || user?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.name || user?.displayName || '');
  }, [profile?.name, user?.displayName]);

  if (loading || (user && !profile)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing profile...</p>
      </div>
    );
  }

  if (!profile || !user) {
    return <div className="p-4 text-amber-500">Please sign in to view your profile.</div>;
  }

  const phone = (profile as any).phone || (profile as any).whatsapp || (profile as any).mobile || (profile as any).phoneNumber || 'N/A';
  const accountEmail = user.email || profile.email || '';
  const passwordChecks = getPasswordChecks(newPassword);
  const passwordStatus = validateStrongPassword(newPassword);

  const handleSaveName = async () => {
    const cleanName = displayName.trim();
    if (!cleanName) {
      toast.error('Name enter karein.');
      return;
    }

    setSavingName(true);
    try {
      await updateProfile(user, { displayName: cleanName });
      await updateDocument('user', profile.id || user.uid, { name: cleanName });
      toast.success('Profile name update ho gaya.');
    } catch (error: any) {
      toast.error(error?.message || 'Profile update nahi ho saka.');
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!accountEmail) {
      toast.error('Account email nahi mila.');
      return;
    }
    if (!currentPassword) {
      toast.error('Current password enter karein.');
      return;
    }
    if (!passwordStatus.isStrong) {
      toast.error('New password strong nahi hai.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password aur confirm password match nahi kar rahe.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(accountEmail, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password update ho gaya.');
    } catch (error: any) {
      const message =
        error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential'
          ? 'Current password galat hai.'
          : error?.code === 'auth/requires-recent-login'
            ? 'Dobara login karke password update karein.'
            : error?.code === 'auth/weak-password'
              ? 'New password aur strong rakhein.'
              : error?.code === 'auth/provider-already-linked' || error?.code === 'auth/operation-not-allowed'
                ? 'Google login wale account ka password Google account se change hota hai.'
                : error?.message || 'Password update nahi ho saka.';
      toast.error(message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const passwordInput = (
    id: string,
    value: string,
    setValue: (value: string) => void,
    visible: boolean,
    setVisible: (value: boolean) => void,
    placeholder: string,
    autoComplete: string
  ) => (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
        onClick={() => setVisible(!visible)}
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <span className="text-2xl font-black">{(profile.name || user.displayName || 'U')[0]}</span>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black tracking-tight text-slate-900">{profile.name || user.displayName || 'User'}</h2>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{profile.role} account</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Mail className="h-3.5 w-3.5" /> Login Email
              </p>
              <p className="break-all text-sm font-bold text-slate-800">{accountEmail || 'N/A'}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Phone className="h-3.5 w-3.5" /> Phone
              </p>
              <p className="text-sm font-bold text-slate-800">{phone}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Status
              </p>
              <span className={cn(
                'inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest',
                profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              )}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Username</h3>
                <p className="text-xs font-medium text-slate-400">Admin aur customer dono apna display name update kar sakte hain.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900"
              />
              <Button
                onClick={handleSaveName}
                disabled={savingName}
                className="h-11 rounded-xl bg-indigo-600 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {savingName ? 'Saving...' : 'Save Name'}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Password Security</h3>
                <p className="text-xs font-medium text-slate-400">Password hidden rehta hai. Current password de kar new password set karein.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</Label>
                {passwordInput('current-password', currentPassword, setCurrentPassword, showCurrentPassword, setShowCurrentPassword, 'Current password', 'current-password')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
                {passwordInput('new-password', newPassword, setNewPassword, showNewPassword, setShowNewPassword, 'New strong password', 'new-password')}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className={cn(
                      'flex min-h-8 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-normal',
                      check.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                    )}
                  >
                    <ShieldCheck className={cn('h-3.5 w-3.5 shrink-0', check.passed ? 'text-emerald-500' : 'text-slate-300')} />
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Password</Label>
                {passwordInput('confirm-password', confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, 'Confirm new password', 'new-password')}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] font-bold text-rose-500">Password match nahi kar raha.</p>
                )}
              </div>
              <Button
                onClick={handleUpdatePassword}
                disabled={updatingPassword || !currentPassword || !passwordStatus.isStrong || newPassword !== confirmPassword}
                className="h-11 w-full rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

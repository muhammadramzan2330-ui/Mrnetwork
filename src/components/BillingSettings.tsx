import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Smartphone, 
  CreditCard, 
  Bell, 
  AtSign, 
  Save,
  MessageSquare,
  ShieldCheck,
  Percent,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { motion } from 'motion/react';
import { useSystem } from '../contexts/SystemContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BillingSettings() {
  const { settings, updateSettings, loading } = useSystem();
  const [formData, setFormData] = useState({
    easypaisaName: 'Muhammad Ramzan',
    easypaisaNumber: '03001234567',
    adminPhone: '03040232330',
    adminEmail: 'mrnetwork.support@gmail.com',
    jazzcashName: 'Muhammad Ramzan',
    jazzcashNumber: '03451234567',
    bankName: 'HBL Bank',
    bankAccount: '12345678901234',
    autoDeduct: true,
    smsReminder: true,
    reminderDays: 3,
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(formData);
  };

  if (loading) return null;

  const sections = [
    {
      title: 'Payment Information',
      icon: CreditCard,
      description: 'Setup your primary collection methods',
      fields: [
        { label: 'Easypaisa Number', key: 'easypaisaNumber', placeholder: '03001234567', icon: Smartphone },
        { label: 'Easypaisa Name', key: 'easypaisaName', placeholder: 'Muhammad Ramzan' },
        { label: 'JazzCash Number', key: 'jazzcashNumber', placeholder: '03451234567', icon: Smartphone },
        { label: 'JazzCash Name', key: 'jazzcashName', placeholder: 'Muhammad Ramzan' },
      ]
    },
    {
      title: 'Support Contact',
      icon: MessageSquare,
      description: 'Customer support phone and email shown in app',
      fields: [
        { label: 'Admin Phone', key: 'adminPhone', placeholder: '03040232330', icon: Smartphone },
        { label: 'Admin Email', key: 'adminEmail', placeholder: 'mrnetwork.support@gmail.com', icon: AtSign },
      ]
    },
    {
      title: 'Automation & Logic',
      icon: Settings,
      description: 'Manage automated billing behavior',
      switches: [
        { label: 'Auto Expiry Deduction', key: 'autoDeduct', desc: 'Deduct from wallet balance on expiry' },
        { label: 'SMS Reminders', key: 'smsReminder', desc: 'Send notifications before/after expiry' },
      ],
      custom: true
    }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] pb-8">
      {/* Header */}
      <div className="px-4 sm:px-8 py-6 flex flex-col items-start bg-white border-b border-slate-100">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none text-center sm:text-left">Billing Settings</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">Configure payment methods & automation</p>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-8 max-w-2xl mx-auto w-full">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <section.icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider leading-none">{section.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">{section.description}</p>
              </div>
            </div>
            
            <Card className="bg-white border-slate-100 shadow-sm p-6 sm:p-8 rounded-2xl space-y-6">
              {section.fields?.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{field.label}</Label>
                  <div className="relative group">
                    {field.icon && <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />}
                    <Input 
                      value={(formData as any)[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className={cn(
                        "input-modern font-bold tracking-wide text-[11px] px-4 h-12 normal-case",
                        field.icon && "pl-12"
                      )}
                    />
                  </div>
                </div>
              ))}

              {section.switches?.map((s) => (
                <div key={s.key} className="flex items-center justify-between py-4 border-t border-slate-50 first:border-none first:pt-0">
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-slate-900 tracking-tight uppercase leading-none">{s.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">{s.desc}</p>
                  </div>
                  <Switch 
                    checked={(formData as any)[s.key]}
                    onCheckedChange={(checked) => setFormData({ ...formData, [s.key]: checked })}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              ))}

              {section.custom && (
                <div className="border-t border-slate-50 pt-6">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Reminder Threshold (Days)</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="number" 
                        value={formData.reminderDays}
                        onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                        className="input-modern w-32 text-center font-extrabold text-xl"
                      />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Days Window</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}

        <div className="pt-4 pb-8">
          <Button 
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 gap-3"
          >
            <Save className="w-5 h-5" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

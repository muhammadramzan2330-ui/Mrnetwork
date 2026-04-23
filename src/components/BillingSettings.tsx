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
      title: 'Payment Methods',
      icon: CreditCard,
      fields: [
        { label: 'Easypaisa Number', key: 'easypaisaNumber', placeholder: '03001234567', icon: Smartphone },
        { label: 'Easypaisa Name', key: 'easypaisaName', placeholder: 'Muhammad Ramzan' },
        { label: 'JazzCash Number', key: 'jazzcashNumber', placeholder: '03451234567', icon: Smartphone },
        { label: 'JazzCash Name', key: 'jazzcashName', placeholder: 'Muhammad Ramzan' },
      ]
    },
    {
      title: 'Automation',
      icon: Settings,
      fields: [],
      switches: [
        { label: 'Auto Expiry Deduction', key: 'autoDeduct', desc: 'Deduct from wallet balance on expiry' },
        { label: 'SMS Reminders', key: 'smsReminder', desc: 'Send notifications before/after expiry' },
      ],
      custom: (
        <div className="grid gap-2 mt-4 ml-1">
          <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted">Reminder Threshold (Days)</Label>
          <Input 
            type="number" 
            value={formData.reminderDays}
            onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
            className="rounded-xl bg-bg-gray border-none h-11 px-4 font-bold text-sm w-32"
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-black text-text-main leading-tight">Billing Settings</h2>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">System Configuration</p>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <section.icon className="w-4 h-4" />
              {section.title}
            </h3>
            
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-text-muted ml-1">{field.label}</Label>
                  <div className="relative">
                    {field.icon && <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                    <Input 
                      value={(formData as any)[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className={cn(
                        "rounded-2xl bg-bg-gray border-none h-12 px-4 font-bold text-sm",
                        field.icon && "pl-11"
                      )}
                    />
                  </div>
                </div>
              ))}

              {section.switches?.map((s) => (
                <div key={s.key} className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-text-main">{s.label}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.desc}</p>
                  </div>
                  <Switch 
                    checked={(formData as any)[s.key]}
                    onCheckedChange={(checked) => setFormData({ ...formData, [s.key]: checked })}
                  />
                </div>
              ))}

              {section.custom}
            </div>
          </motion.div>
        ))}
      </div>

      <Button 
        onClick={handleSave}
        className="w-full bg-primary hover:bg-primary-dark rounded-2xl h-14 font-black text-base shadow-xl shadow-primary/30 gap-2"
      >
        <Save className="w-5 h-5" /> Save Configuration
      </Button>
    </div>
  );
}

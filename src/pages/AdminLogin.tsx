import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Mail } from 'lucide-react';

import { STRAPI_URL } from '@/lib/strapiClient';

const AdminLogin = () => {
    const [email, setEmail] = useState('admin@attr.com');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // If already logged in as admin, redirect
    if (localStorage.getItem('admin_token')) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${STRAPI_URL}/api/auth/panel/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.error?.message || 'Login failed');
                return;
            }
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_info', JSON.stringify(data.admin));
            toast.success('Welcome, Admin!');
            navigate('/admin/dashboard', { replace: true });
        } catch (e: any) {
            toast.error(e?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f9f9] relative overflow-hidden font-sans flex items-center justify-center p-4">
            {/* Ambient background */}
            <div className="ambient-shape shape-1" style={{ top: '-10%', right: '-5%', background: '#089bab', width: '600px', height: '600px' }}></div>
            <div className="ambient-shape shape-2" style={{ bottom: '-10%', left: '-5%', background: '#6366f1', opacity: 0.15 }}></div>

            <div className="glass-card w-full max-w-md relative z-10 !p-8 shadow-2xl border-white/40 border">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                        <img 
                            src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png" 
                            alt="ATTR Navigator Logo" 
                            className="w-full h-full object-contain drop-shadow-md" 
                        />
                    </div>
                    <h1 className="text-[1.8rem] font-bold text-slate-800 mb-2 leading-tight">Admin Portal</h1>
                    <p className="text-slate-500 text-sm">ATTR Navigator System Administration</p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-slate-600 font-medium mb-2 text-sm">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-12 bg-white/70 border-slate-200/60 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-[#089bab] focus:ring-[#089bab]/20 transition-all font-medium"
                                placeholder="admin@attr.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-600 font-medium mb-2 text-sm">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className="pl-10 h-12 bg-white/70 border-slate-200/60 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-[#089bab] focus:ring-[#089bab]/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-[#089bab] to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white text-lg font-semibold rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                        {loading ? 'Authenticating...' : 'Secure SignIn'}
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center border-t border-slate-200/50 pt-4">
                    <a href="/login" className="text-[#089bab] font-medium text-sm hover:text-teal-700 transition-colors inline-block hover:-translate-x-1 duration-200">
                        ← Return to Doctor Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

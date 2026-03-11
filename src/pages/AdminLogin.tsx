import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, Lock, Mail } from 'lucide-react';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

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
        <div className="min-h-screen bg-gradient-to-br from-[hsl(184,91%,17%)] via-[hsl(184,58%,28%)] to-[hsl(184,58%,35%)] flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl mb-4 shadow-lg shadow-teal-900/30">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
                    <p className="text-teal-100/70 text-sm">ATTR-CM Tracker System Administration</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-teal-100 font-medium mb-2 text-sm">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-200/50" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-teal-100/40 rounded-xl focus:border-teal-300 focus:ring-teal-400/20"
                                placeholder="admin@attr.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-teal-100 font-medium mb-2 text-sm">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-200/50" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-teal-100/40 rounded-xl focus:border-teal-300 focus:ring-teal-400/20"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-[hsl(184,58%,44%)] to-[hsl(184,58%,35%)] hover:from-[hsl(184,58%,48%)] hover:to-[hsl(184,58%,40%)] text-white text-lg font-semibold rounded-xl shadow-lg shadow-teal-900/30 transition-all duration-200"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-teal-100/40 text-xs">
                        Default: admin@attr.com / Admin123!
                    </p>
                </div>
                <div className="mt-4 text-center">
                    <a href="/login" className="text-cyan-300/70 text-sm hover:text-cyan-300 transition-colors">
                        ← Back to Doctor Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

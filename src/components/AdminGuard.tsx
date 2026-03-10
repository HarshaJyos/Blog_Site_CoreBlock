'use client';

import { useAuth } from '@/components/AuthContext';
import { useState } from 'react';

const ADMIN_EMAIL = 'admincoreblocksurya@ikyk.com';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, signInWithEmail, signInWithGoogle, logout } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center animate-bounce">
                        <span className="text-white font-black text-base">C</span>
                    </div>
                    <p className="text-zinc-500 font-medium animate-pulse">Verifying Access...</p>
                </div>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setAuthLoading(true);
            setError('');
            await signInWithEmail(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setAuthLoading(true);
            setError('');
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setAuthLoading(false);
        }
    };

    // If not logged in, show login screen specifically for admin
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center mb-4">
                            <span className="text-white font-black text-xl">C</span>
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">Admin Portal</h2>
                        <p className="text-sm text-zinc-500 mt-2">Sign in to manage CoreBlock.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow outline-none text-zinc-950"
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow outline-none text-zinc-950"
                                placeholder={"••••••••"}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-2.5 px-4 bg-zinc-950 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-2"
                        >
                            {authLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={authLoading}
                        className="w-full relative flex items-center justify-center gap-3 px-4 py-3 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                </div>
            </div>
        );
    }

    // If logged in but not admin
    if (user.email !== ADMIN_EMAIL) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6 text-red-600">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h1>
                <p className="text-zinc-500 max-w-sm mb-8">Your account ({user.email}) does not have administrator privileges.</p>
                <div className="flex gap-4">
                    <a href="/" className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors">
                        Return Home
                    </a>
                    <button onClick={logout} className="px-6 py-2.5 bg-zinc-950 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors">
                        Sign out
                    </button>
                </div>
            </div>
        );
    }

    // Authorized admin
    return <>{children}</>;
}

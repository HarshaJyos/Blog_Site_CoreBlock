'use client';

import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
}

export function LoginModal({ isOpen, onClose, title = "Sign In Required", subtitle = "Join the community to continue." }: LoginModalProps) {
    const { signInWithGoogle, signInWithEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            await signInWithGoogle();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-8 sm:p-8">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center mb-4">
                            <span className="text-white font-black text-xl">C</span>
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">{title}</h2>
                        <p className="text-sm text-zinc-500 mt-2">{subtitle}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            setLoading(true);
                            setError('');
                            await signInWithEmail(email, password);
                            onClose();
                        } catch (err: any) {
                            setError(err.message || 'Failed to sign in.');
                        } finally {
                            setLoading(false);
                        }
                    }} className="space-y-4 mb-5">
                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow outline-none text-zinc-950 text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow outline-none text-zinc-950 text-sm"
                                placeholder="Password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-zinc-950 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Signing in...' : 'Sign In with Email'}
                        </button>
                    </form>

                    <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-zinc-400 uppercase tracking-wider font-semibold">Or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full relative flex items-center justify-center gap-3 px-4 py-3 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-zinc-400">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>,
        document.body
    );
}

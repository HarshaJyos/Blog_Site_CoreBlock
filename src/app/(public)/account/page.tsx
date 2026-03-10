'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center animate-bounce">
                    <span className="text-white font-black text-base">C</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-950 mb-8">My Account</h1>

            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="px-6 py-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 flexitems-center justify-center shrink-0 border border-zinc-200">
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-400">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-zinc-900 mb-1">{user.displayName || 'Community Member'}</h2>
                        <p className="text-zinc-500 mb-4">{user.email}</p>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Verified Account
                            </span>
                            {user.email === 'admincoreblocksurya@ikyk.com' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Administrator
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors shrink-0"
                    >
                        Sign out
                    </button>
                </div>

                <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
                    <p className="text-sm text-zinc-500 text-center">
                        Account ID: <span className="font-mono text-xs">{user.uid}</span>
                    </p>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-xl font-bold tracking-tight text-zinc-950 mb-4">Account Settings</h3>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-zinc-500 text-sm">
                        Settings and preferences will be available in a future update. For now, your account grants you ability to like and comment on community articles!
                    </p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { adminLogin } from '@/app/admin/actions';

export default function AdminLoginForm() {
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // On success, the server action redirects — no need to handle here
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Enter admin password"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4 transition-shadow"
      />
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

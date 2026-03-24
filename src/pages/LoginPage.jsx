import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Crown, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.success) {
          navigate('/MainMenu');
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        const result = await signUp(email, password);
        if (result.success) {
          setMessage(result.message);
        } else {
          setError(result.error || 'Signup failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A0A0F 0%, #1a1510 50%, #0A0A0F 100%)'
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gold Glow Effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />

      {/* Login Card */}
      <div 
        className="relative z-10 w-full max-w-md p-8 rounded-2xl"
        style={{
          background: 'rgba(20, 16, 10, 0.95)',
          border: '2px solid rgba(201, 168, 76, 0.4)',
          boxShadow: '0 0 40px rgba(201, 168, 76, 0.15), inset 0 0 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(139,105,20,0.2) 100%)',
              border: '2px solid rgba(201, 168, 76, 0.5)'
            }}
          >
            <Crown className="w-10 h-10" style={{ color: '#C9A84C' }} />
          </div>
          <h1 
            className="text-2xl font-bold mb-1"
            style={{ 
              fontFamily: 'Cinzel, serif',
              color: '#FFD700',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
            }}
          >
            The Citadel
          </h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            Crown & Counsel
          </p>
        </div>

        {/* Toggle */}
        <div className="flex mb-6 rounded-lg overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <button
            onClick={() => setIsLogin(true)}
            className="flex-1 py-2 text-sm font-medium transition-all"
            style={{
              background: isLogin ? 'rgba(201,168,76,0.2)' : 'transparent',
              color: isLogin ? '#C9A84C' : '#666'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className="flex-1 py-2 text-sm font-medium transition-all"
            style={{
              background: !isLogin ? 'rgba(201,168,76,0.2)' : 'transparent',
              color: !isLogin ? '#C9A84C' : '#666'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#8B7355' }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#E0E0E0'
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#8B7355' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#E0E0E0'
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: 'rgba(192, 57, 43, 0.2)', color: '#E74C3C', border: '1px solid rgba(192, 57, 43, 0.3)' }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: 'rgba(39, 174, 96, 0.2)', color: '#27AE60', border: '1px solid rgba(39, 174, 96, 0.3)' }}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
              color: '#0A0A0F',
              fontFamily: 'Cinzel, serif'
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Enter The Citadel' : 'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: '#555' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium hover:underline"
            style={{ color: '#C9A84C' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* Developer Note */}
        <div className="mt-6 pt-4 text-center"
          style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}
        >
          <p className="text-[10px]" style={{ color: '#444' }}>
            Developer: dickoifenta27@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

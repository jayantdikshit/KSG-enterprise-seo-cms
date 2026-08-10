"use client";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Zap } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (siteKey && !captchaToken) {
      alert("Please complete the reCAPTCHA verification.");
      return;
    }
    const success = await login(email, password, captchaToken || undefined);
    if (success) router.replace('/admin/dashboard');
  };

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '13px 16px',
    backgroundColor: '#0f172a',
    border: `1px solid ${focusedField === field ? 'rgba(74, 222, 128, 0.5)' : '#334155'}`,
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(74, 222, 128, 0.12)' : 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        .login-page-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .login-card {
          animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .login-logo-float {
          animation: floatUp 4s ease-in-out infinite;
        }
        .login-glow-1 {
          animation: pulseGlow 4s ease-in-out infinite;
        }
        .login-glow-2 {
          animation: pulseGlow 4s ease-in-out infinite 2s;
        }
        .login-submit-btn {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          padding: 14px;
          transition: all 0.3s ease;
          width: 100%;
        }
        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(34, 197, 94, 0.35);
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-eye-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.2s;
        }
        .login-eye-btn:hover {
          color: #4ADE80;
        }
        .login-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 1.5px solid #334155;
          border-radius: 4px;
          background: #0f172a;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .login-checkbox:checked {
          background: #22c55e;
          border-color: #22c55e;
        }
        .login-checkbox:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 11px;
          font-weight: 700;
        }
      `}</style>

      <div
        className="login-page-root"
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 24px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background glows */}
        <div
          className="login-glow-1"
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          className="login-glow-2"
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        {/* Dot grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(74,222,128,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />

        {/* Login Card */}
        <div
          className="login-card"
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '40px 36px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo + Brand */}
          <div className="login-logo-float" style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}>
                <Image
                  src="/logo.png"
                  alt="KSG Energy Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={() => {}}
                />
              </div>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#f1f5f9',
                letterSpacing: '-0.5px',
              }}>
                KSG <span style={{ color: '#4ADE80' }}>Energy</span>
              </span>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
              <Zap size={14} color="#4ADE80" />
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 400 }}>
              Sign in to access the admin panel
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '8px' }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                placeholder="admin@ksgenergy.com"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle('email')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...inputStyle('password'), paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="remember"
                className="login-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                Remember me
              </label>
            </div>

            {/* reCAPTCHA */}
            {siteKey ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <ReCAPTCHA
                  sitekey={siteKey}
                  theme="dark"
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
            ) : (
              <div style={{ padding: '10px', border: '1px dashed #475569', borderRadius: '6px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
                ⚠️ reCAPTCHA not configured. Add <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> to <code>.env.local</code>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
              style={{ marginTop: '4px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer note */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.78rem', color: '#475569' }}>
            This portal is for authorized administrators only.
          </p>
        </div>
      </div>
    </>
  );
}

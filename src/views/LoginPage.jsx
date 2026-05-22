import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { checkRateLimit, formatRateLimitMessage } from '../utils/rateLimit';
import { sanitizeText } from '../utils/sanitize';

// --- VISUAL MEDIA ASSETS ---
import LoginLogo from '../assets/customs-logo.jpg';
import BackgroundImage from '../assets/becuk foto.jpg';

/**
 * COMPONENT: LoginPage
 * PURPOSE: Secure gateway authenticating platform identities for the portal board.
 * DESIGN PATTERN: Glassmorphism layout design over dynamic mathematical mouse-parallax layers.
 */
const LoginPage = () => {
  // --- FORM DATA CONTROLLER STATES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [source, setSource] = useState('');

  // --- INTERFACE CONFIGURATION STATES ---
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- CINEMATIC PARALLAX COORDINATE MATRIX HOOKS ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  /**
   * EVENT LISTENER: handleMouseMove
   * PURPOSE: Captures raw monitor client vector tracks and normalizes them into
   * a safe symmetrical bounding coordinate ratio (-1 to 1) for structural hardware offsets.
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Garbage Collection: Disposes event loops cleanly on component unmount
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /**
   * CONTROLLER TRANSACTION PIPELINE: handleSubmit
   * PURPOSE: Manages credential routing channels for incoming traffic. Maps fields directly
   * straight onto the Supabase auth schema metadata configurations.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

        const rateKey = isRegisterMode ? 'login-register' : 'login-signin';
        const rateLimit = checkRateLimit(rateKey, 10000);
        if (!rateLimit.allowed) {
                setError(formatRateLimitMessage(rateLimit.retryAfterMs));
                return;
        }

    setLoading(true);

    try {
        if (isRegisterMode) {
            // Frontend safety validation check
            const cleanEmail = sanitizeText(email, { forceLowercase: true, maxLength: 254 });
            const cleanName = sanitizeText(name, { maxLength: 100 });
            const cleanInitials = sanitizeText(initials, { forceUppercase: true, maxLength: 2 });
            const cleanSource = sanitizeText(source, { maxLength: 120 });

            if (!cleanSource) throw new Error("Please specify your University/Source origin.");
            
            /**
             * AUTH DISPATCH CHANNEL: auth.signUp
             * options.data: Appends customized fields directly onto the system's auth metadata JSON pool.
             * Trigger triggers automated insertion callbacks mapping rows to public.profiles natively.
             */
            const { error } = await supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: { 
                    data: { 
                        name: cleanName, 
                        initials: cleanInitials,
                        source: cleanSource // Keeps onboarding text free of markup and control characters
                    } 
                }
            });
            if (error) throw error;
            setMessage('Registration successful! Verify using the link dispatched to your email.');
        } else {
            const cleanEmail = sanitizeText(email, { forceLowercase: true, maxLength: 254 });

            /**
             * ACCESS TOKEN REQUEST CHANNEL: auth.signInWithPassword
             * Authenticates official email handles and switches global state context inside root App.jsx.
             */
            const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
            if (error) throw error;
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center font-sans bg-slate-900">
      
      {/* 1. CINEMATIC PARALLAX HARDWARE ACCELERATED BACKGROUND LAYER */}
      <div 
        className="absolute inset-0 z-0 transition-transform duration-100 ease-out behavior-gpu"
        style={{
            backgroundImage: `url("${BackgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Calculates translate vectors symmetrically to create dynamic layout immersion depths
            transform: `scale(1.1) translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`
        }}
      />

      {/* 2. GRADIENT ISOLATION COLOR LAYER MASK */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-yellow-900/30 mix-blend-multiply" />
      
      {/* 3. CENTER STRUCTURED GLASSMORPHISM CORE AUTHENTICATION PANEL */}
      <div className="relative z-10 w-full max-w-md p-8 m-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl ring-1 ring-black/5 animate-fade-in-up">
        
        {/* Core Institutional Brand Typography Headers */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4 shadow-inner border border-white/10">
                <img src={LoginLogo} alt="Customs Logo Asset" className="h-12 w-auto drop-shadow-md mix-blend-multiply" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-1 drop-shadow-md">
                Bea Cukai
            </h2>
            <p className="text-blue-100 text-xs font-bold tracking-[0.2em] uppercase opacity-80">
                Employee Monitoring System
            </p>
        </div>

        {/* Action Transaction Form Sheet */}
        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* CONDITIONAL SUB-LAYOUT BLOCK: COLLECT ONBOARDING PROFILE METADATA IF IN REGISTER MODE */}
            {isRegisterMode && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-blue-100 uppercase ml-1">Full Name</label>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                            type="text" 
                            placeholder="Perrell Brown" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-blue-100 uppercase ml-1">Initials</label>
                        <input 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-center uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                            type="text" 
                            placeholder="PB" 
                            value={initials} 
                            onChange={(e) => setInitials(e.target.value)} 
                            required 
                            maxLength="2" 
                        />
                    </div>
                </div>
            )}

            {/* Standard Login / Registration Inputs */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-blue-100 uppercase ml-1">Official Email</label>
                <input 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                    type="email" 
                    placeholder="officer@customs.go.id" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
            </div>

            {/* CONDITIONAL REGISTER REGION ONLY: Custom Academic Source Allocation Input */}
            {isRegisterMode && (
                <div className="space-y-1 animate-fade-in">
                    <label className="text-xs font-bold text-blue-100 uppercase ml-1">Source / University</label>
                    <input 
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                        type="text" 
                        placeholder="e.g. President University" 
                        value={source} 
                        onChange={(e) => setSource(e.target.value)} 
                        required 
                    />
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-blue-100 uppercase ml-1">Password</label>
                <input 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
            </div>

            {/* Platform Dynamic Notification Alerts Box */}
            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm flex items-center gap-2 animate-shake">
                    <span>⚠️</span> {error}
                </div>
            )}
            {message && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-100 text-sm flex items-center gap-2">
                    <span>✅</span> {message}
                </div>
            )}

            {/* Execution Transmission Trigger Button */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold py-3.5 rounded-lg shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Verifying Credentials...' : (isRegisterMode ? 'Register Account' : 'Access Portal')}
            </button>

            {/* Form Application State Switcher Toggle */}
            <div className="text-center pt-2">
                <button 
                    onClick={(e) => { e.preventDefault(); setIsRegisterMode(!isRegisterMode); setError(''); setMessage(''); }}
                    className="text-sm text-blue-200 hover:text-white hover:underline transition-colors"
                >
                    {isRegisterMode ? 'Back to Login' : 'Register New Officer'}
                </button>
            </div>
        </form>
      </div>

      {/* Security Level Compliance Disclaimer Footer */}
      <div className="absolute bottom-4 text-white/20 text-xs font-mono select-none">
        Authorized Access Only • Directorate General of Customs and Excise
      </div>
    </div>
  );
};

export default LoginPage;
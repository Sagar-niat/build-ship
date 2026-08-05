import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('USER');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('trustguard_user', JSON.stringify({ fullName, email, role }));
    localStorage.setItem('trustguard_token', 'demo-registered-jwt-token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111625] border border-[#1e2638] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TrustGuard AI</h1>
            <p className="text-xs text-slate-400">Create Security Operations Account</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
            <div className="flex items-center bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3.5 py-2.5">
              <User className="w-4 h-4 text-slate-500 mr-2.5" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-transparent border-none text-sm text-white focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Corporate Email</label>
            <div className="flex items-center bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3.5 py-2.5">
              <Mail className="w-4 h-4 text-slate-500 mr-2.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@acme-sec.com"
                className="w-full bg-transparent border-none text-sm text-white focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
            <div className="flex items-center bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3.5 py-2.5">
              <Lock className="w-4 h-4 text-slate-500 mr-2.5" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-white focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Role Authorization</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-400 focus:outline-none"
            >
              <option value="USER">USER — Read & Analyze</option>
              <option value="SECURITY_ANALYST">SECURITY_ANALYST — Resolve & Review</option>
              <option value="ADMIN">ADMIN — Full Governance & Audit Access</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            Create Account <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered? <Link to="/login" className="text-cyan-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

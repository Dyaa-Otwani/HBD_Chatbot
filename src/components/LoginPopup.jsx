import React, { useState } from 'react';
import { X, Phone, ArrowRight, User, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPopup({ onClose, onSuccess }) {
  const [step, setStep] = useState('phone'); // phone | otp
  const [method, setMethod] = useState('phone'); // phone | email
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    otp: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 'phone') {
      if (method === 'phone') {
        const cleanPhone = formData.phone.trim();
        if (!cleanPhone || cleanPhone.length !== 10) {
          setError('Please enter a valid 10-digit mobile number.');
          return;
        }
        
        setIsLoading(true);
        try {
          // Direct login for phone (No OTP, No Recaptcha)
          console.log("Direct Phone Login for:", cleanPhone);
          await onSuccess(cleanPhone, 'phone');
          onClose();
        } catch (err) {
          setError(`Login failed: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        // EMAIL METHOD (Keep OTP for email as it wasn't explicitly asked to be removed, only "mobile otp")
        const cleanEmail = formData.email.trim();
        if (!cleanEmail || !cleanEmail.includes('@')) {
          setError('Please enter a valid email address.');
          return;
        }

        setIsLoading(true);
        try {
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, type: 'login' })
          }).then(res => res.json());

          if (response.success) {
            setStep('otp');
          } else {
            setError(response.message || 'Failed to send OTP to email.');
          }
        } catch (err) {
          setError('Connection error or invalid request.');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }

    if (step === 'otp') {
      if (!formData.otp.trim()) {
        setError('Please enter the OTP.');
        return;
      }
      
      setIsLoading(true);
      try {
        let isVerified = false;

        if (formData.otp === '1234') {
          isVerified = true;
        } else if (method === 'email') {
          const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp: formData.otp })
          }).then(res => res.json());

          if (response.success) {
            isVerified = true;
          } else {
            setError(response.message || 'Invalid email verification code.');
            setIsLoading(false);
            return;
          }
        }

        if (isVerified) {
          await onSuccess(method === 'phone' ? formData.phone.trim() : formData.email.trim(), method);
          onClose();
        } else {
          setError('Invalid OTP.');
        }
      } catch (err) {
        setError('Connection error or invalid verification.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* The Card */}
      <div className="relative w-full bg-white rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'otp' ? 'Verification' : (isRegister ? 'Create Account' : 'Welcome Back')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {step === 'otp' ? 'Enter the code sent to your email' : (isRegister ? 'Enter details to start' : 'Login with your registered phone or email')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {step === 'phone' && (
            <>
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'phone' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  Email
                </button>
              </div>

              {isRegister && (
                <div className="relative mb-3">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" placeholder="Full Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}

              {method === 'phone' ? (
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-500 font-bold text-sm">+91</div>
                  <input 
                    type="tel" placeholder="Mobile Number (10 digits)" inputMode="numeric"
                    maxLength={10}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-[#4F46E5] outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">@</div>
                  <input 
                    type="email" placeholder="Email Address"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:ring-2 focus:ring-[#4F46E5] outline-none"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              )}
            </>
          )}

          {step === 'otp' && (
            <div className="relative">
              <input 
                type="text" placeholder="Enter OTP (Mock: 1234)" 
                maxLength={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 text-center text-xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-[#4F46E5] outline-none"
                value={formData.otp}
                onChange={e => setFormData({ ...formData, otp: e.target.value })}
                required
                autoFocus
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full ${step === 'phone' && method === 'phone' ? 'bg-[#4F46E5]' : (step === 'phone' && method === 'email' ? 'bg-[#128C7E]' : 'bg-[#4F46E5]')} text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>{step === 'otp' ? 'Verify OTP' : (step === 'phone' ? (method === 'phone' ? 'Login Now' : 'Get Email OTP') : 'Continue')} <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {step === 'otp' ? (
              <button onClick={() => setStep('phone')} className="text-[#4F46E5] font-bold">Resend or Change Method</button>
            ) : (
              <>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button onClick={() => setIsRegister(!isRegister)} className="ml-1 text-[#4F46E5] font-bold">
                  {isRegister ? 'Log in' : 'Sign up'}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

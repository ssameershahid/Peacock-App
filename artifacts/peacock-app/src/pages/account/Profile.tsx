import React, { useState } from 'react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { Camera, Check, AlertTriangle, Mail, Globe } from 'lucide-react';

export default function Profile() {
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [firstName, setFirstName] = useState('James');
  const [lastName, setLastName] = useState('Mitchell');
  const [phone, setPhone] = useState('+44 7700 123456');
  const [country, setCountry] = useState('United Kingdom');

  return (
    <div>
      <SectionHeading title="My *profile*" className="mb-6" />

      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
        <h3 className="font-body font-semibold text-forest-600 mb-6">Personal Information</h3>

        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-display text-3xl">
              JM
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center shadow-md hover:bg-forest-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h4 className="font-body font-semibold text-forest-600">James Mitchell</h4>
            <button className="font-body text-sm text-forest-500 hover:text-forest-600 underline underline-offset-2">Change photo</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">First Name</label>
            <input
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Last Name</label>
            <input
              value={lastName}
              onChange={e => { setLastName(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <input
              value="james.m@gmail.com"
              readOnly
              className="w-full border border-warm-200 rounded-xl pl-11 pr-4 py-2.5 font-body text-sm bg-warm-50 text-warm-500 cursor-not-allowed"
            />
          </div>
          <p className="font-body text-xs text-warm-400 mt-1">Contact support to change your email address</p>
        </div>

        <div className="mb-4">
          <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Phone Number</label>
          <input
            value={phone}
            onChange={e => { setPhone(e.target.value); setSaved(false); }}
            className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
          />
        </div>

        <div className="mb-6">
          <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Country</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <select
              value={country}
              onChange={e => { setCountry(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl pl-11 pr-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 appearance-none bg-white"
            >
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Australia</option>
              <option>Canada</option>
              <option>Germany</option>
              <option>France</option>
              <option>Sri Lanka</option>
            </select>
          </div>
        </div>

        <Button
          className="rounded-pill"
          onClick={() => setSaved(true)}
        >
          {saved ? <><Check className="w-4 h-4 mr-2" /> Changes saved</> : 'Save changes'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
        <h3 className="font-body font-semibold text-forest-600 mb-6">Change Password</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Current Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">New Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
        </div>

        <Button
          variant="outline"
          className="rounded-pill"
          onClick={() => setPasswordSaved(true)}
        >
          {passwordSaved ? <><Check className="w-4 h-4 mr-2" /> Password updated</> : 'Update password'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
        <h3 className="font-body font-semibold text-forest-600 mb-4">Connected Accounts</h3>
        <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-warm-100 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <span className="font-body text-sm font-medium text-forest-600">Google</span>
              <span className="font-body text-sm text-warm-400 block">Connected as james.m@gmail.com</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-pill text-red-500 hover:text-red-600 hover:border-red-200">
            Disconnect
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
        <h3 className="font-body font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="font-body text-sm text-warm-500 mb-4">Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
        
        {showDeleteConfirm ? (
          <div className="bg-red-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="font-body text-sm font-medium text-red-700">Are you sure? This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" className="rounded-pill" onClick={() => setShowDeleteConfirm(false)}>
                Yes, delete my account
              </Button>
              <Button variant="outline" className="rounded-pill" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="font-body text-sm font-medium text-red-500 hover:text-red-600 hover:underline underline-offset-2 transition-colors"
          >
            Delete account
          </button>
        )}
      </div>
    </div>
  );
}

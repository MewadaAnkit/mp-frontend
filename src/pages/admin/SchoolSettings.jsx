import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { Settings as SettingsIcon, Save, School, Award, Phone, Mail, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchoolSettings() {
  const { settings, reloadMetadata } = useAcademic();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolHindiName: '',
    schoolAddress: '',
    affiliationCode: '',
    udiseCode: '',
    boardAffiliation: '',
    phone: '',
    email: '',
    website: '',
    enablePublicResultPortal: true,
    allowPublicPdfDownload: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        schoolName: settings.schoolName || '',
        schoolHindiName: settings.schoolHindiName || '',
        schoolAddress: settings.schoolAddress || '',
        affiliationCode: settings.affiliationCode || '',
        udiseCode: settings.udiseCode || '',
        boardAffiliation: settings.boardAffiliation || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        enablePublicResultPortal: settings.enablePublicResultPortal !== false,
        allowPublicPdfDownload: settings.allowPublicPdfDownload !== false
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', formData);
      if (res.data.success) {
        toast.success('School settings updated successfully!');
        reloadMetadata();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>School Institution & MPBSE Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure report card branding, affiliation codes, and portal controls</p>
      </div>

      <div className="app-card p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Official School Name (English) *</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full app-input font-bold text-sm py-2.5"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">School Name (Hindi) *</label>
              <input
                type="text"
                value={formData.schoolHindiName}
                onChange={(e) => setFormData({ ...formData, schoolHindiName: e.target.value })}
                className="w-full app-input font-bold text-sm py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">School Campus Address</label>
            <input
              type="text"
              value={formData.schoolAddress}
              onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
              className="w-full app-input py-2.5 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">MPBSE Affiliation Code</label>
              <input
                type="text"
                value={formData.affiliationCode}
                onChange={(e) => setFormData({ ...formData, affiliationCode: e.target.value })}
                className="w-full app-input font-mono font-bold py-2.5"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">U-DISE+ Code</label>
              <input
                type="text"
                value={formData.udiseCode}
                onChange={(e) => setFormData({ ...formData, udiseCode: e.target.value })}
                className="w-full app-input font-mono font-bold py-2.5"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Contact Helpline</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full app-input py-2.5 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Board Affiliation Header Text</label>
            <input
              type="text"
              value={formData.boardAffiliation}
              onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
              className="w-full app-input py-2.5 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full app-input py-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full app-input py-2.5 font-medium"
              />
            </div>
          </div>

          {/* Portal Toggles */}
          <div className="p-4 app-card-subtle space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white">Public Portal Access Controls</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enablePublicResultPortal}
                  onChange={(e) => setFormData({ ...formData, enablePublicResultPortal: e.target.checked })}
                  className="rounded app-input cursor-pointer"
                />
                <span>Enable Public Result Search Portal for Students</span>
              </label>

              <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowPublicPdfDownload}
                  onChange={(e) => setFormData({ ...formData, allowPublicPdfDownload: e.target.checked })}
                  className="rounded app-input cursor-pointer"
                />
                <span>Allow Public PDF Marksheet Download</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="app-btn-primary disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

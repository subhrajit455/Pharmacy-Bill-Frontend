import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle, Store, ShieldCheck, Printer } from 'lucide-react';
import { settingsApi } from '../services/api';

export default function Settings({ onSettingsUpdated }) {
  const [formData, setFormData] = useState({
    storeName: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    dlNumber1: '',
    dlNumber2: '',
    fssaiNumber: '',
    invoicePrefix: 'PHARM-',
    defaultPrintFormat: 'a4',
    termsAndConditions: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.get();
      if (res.data?.success) {
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await settingsApi.update(formData);
      if (res.data?.success) {
        setSuccessMsg('Store settings and printing preferences saved successfully!');
        if (onSettingsUpdated) onSettingsUpdated(res.data.data);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-navy-800" />
            <span>Pharmacy Profile & Printing Setup</span>
          </h2>
          <p className="text-xs text-navy-700/70 mt-0.5">
            Configure header info, Drug License numbers (20B/21B), GSTIN, and default bill print template
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-bold">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Pharmacy Details */}
        <div className="bg-beige-50 p-4 sm:p-6 rounded-2xl border border-beige-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-navy-950 text-sm flex items-center gap-2 border-b border-beige-200 pb-2">
            <Store className="w-4 h-4 text-navy-800" />
            <span>Store / Pharmacy Business Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="font-bold text-navy-900 block mb-1">Pharmacy / Store Name</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-beige-300 font-bold text-navy-950 focus:outline-navy-700 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-medium focus:outline-navy-700 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-navy-900 block mb-1">Shop Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-medium focus:outline-navy-700 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Phone Number(s)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-semibold focus:outline-navy-700 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-semibold focus:outline-navy-700 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Regulatory & Licenses */}
        <div className="bg-beige-50 p-4 sm:p-6 rounded-2xl border border-beige-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-navy-950 text-sm flex items-center gap-2 border-b border-beige-200 pb-2">
            <ShieldCheck className="w-4 h-4 text-navy-800" />
            <span>Drug Licenses & Tax Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="font-bold text-navy-900 block mb-1">Drug License 20B (Allopathic)</label>
              <input
                type="text"
                value={formData.dlNumber1}
                onChange={(e) => setFormData({ ...formData, dlNumber1: e.target.value })}
                placeholder="DL-20B/12345/2021"
                className="w-full px-3 py-2 rounded-xl border border-beige-300 font-mono font-bold text-navy-950 focus:outline-navy-700 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Drug License 21B (Retail Schedule C/C1)</label>
              <input
                type="text"
                value={formData.dlNumber2}
                onChange={(e) => setFormData({ ...formData, dlNumber2: e.target.value })}
                placeholder="DL-21B/12346/2021"
                className="w-full px-3 py-2 rounded-xl border border-beige-300 font-mono font-bold text-navy-950 focus:outline-navy-700 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="07AAAAA0000A1Z5"
                className="w-full px-3 py-2 rounded-xl border border-beige-300 font-mono uppercase font-bold text-navy-950 focus:outline-navy-700 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">FSSAI License (Optional)</label>
              <input
                type="text"
                value={formData.fssaiNumber}
                onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                placeholder="10019011000123"
                className="w-full px-3 py-2 rounded-xl border border-beige-300 font-mono font-bold text-navy-950 focus:outline-navy-700 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Printing Preferences */}
        <div className="bg-beige-50 p-4 sm:p-6 rounded-2xl border border-beige-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-navy-950 text-sm flex items-center gap-2 border-b border-beige-200 pb-2">
            <Printer className="w-4 h-4 text-navy-800" />
            <span>Printing Options & Invoice Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="font-bold text-navy-900 block mb-1">Default Print Template</label>
              <select
                value={formData.defaultPrintFormat}
                onChange={(e) => setFormData({ ...formData, defaultPrintFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-beige-300 font-bold text-navy-900 focus:outline-navy-700 bg-white cursor-pointer"
              >
                <option value="a4">📄 A4 Standard (Full Tax Invoice)</option>
                <option value="thermal-80">🧾 80mm Thermal (Standard 3" POS Roll)</option>
                <option value="thermal-58">🧾 58mm Thermal (Compact 2" Mini Roll)</option>
                <option value="a5">📑 A5 Half Page (Compact Slip)</option>
              </select>
              <p className="text-[11px] text-navy-500 mt-1">
                You can still freely switch templates at print time on every bill!
              </p>
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="PHARM- or RX-"
                className="w-full px-3 py-2 rounded-xl border border-beige-300 font-mono font-bold text-navy-950 focus:outline-navy-700 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-navy-900 block mb-1">Invoice Terms & Disclaimer</label>
              <textarea
                rows="3"
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-medium focus:outline-navy-700 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-beige-50 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer border border-navy-700 w-full sm:w-auto"
          >
            <Save className="w-4 h-4 text-beige-300" />
            <span>{saving ? 'Saving Preferences...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

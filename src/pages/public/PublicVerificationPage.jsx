import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { ShieldCheck, CheckCircle2, AlertTriangle, School, Award, ArrowLeft } from 'lucide-react';

export default function PublicVerificationPage() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/public/verify/${code}`);
        if (res.data.success && res.data.verified) {
          setData(res.data.data);
        } else {
          setError('Invalid or unverified certificate code');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Result record could not be verified');
      } finally {
        setLoading(false);
      }
    };

    if (code) verify();
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Official Result Verification System
          </h1>
          <p className="text-xs text-slate-400 font-mono">Code: {code}</p>
        </div>

        {loading && (
          <div className="py-8 text-center text-xs text-slate-400">
            Validating digital certificate with secure registry...
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>
                <strong>Digitally Verified Record:</strong> This report card is authentic and was officially published by {data.schoolName}.
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-white">{data.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Admission No / Roll:</span>
                <span className="font-semibold text-slate-200">{data.admissionNo} (Roll #{data.rollNo})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Class & Session:</span>
                <span className="font-semibold text-slate-200">Class {data.className} - '{data.sectionName}' ({data.sessionName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Percentage & Grade:</span>
                <span className="font-bold text-emerald-400">{data.overallPercentage}% ({data.overallGrade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Final Result:</span>
                <span className="font-black text-white">{data.resultStatus} — {data.division}</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            to="/public/search"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Search Another Result</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

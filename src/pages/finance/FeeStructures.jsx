import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function FeeStructures() {
  const { currentSession, classes } = useAcademic();
  const [activeTab, setActiveTab] = useState('structures');
  const [structures, setStructures] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [headModalOpen, setHeadModalOpen] = useState(false);
  const [structModalOpen, setStructModalOpen] = useState(false);

  // Head form
  const [headForm, setHeadForm] = useState({ name: '', code: '', description: '', isOptional: false });

  // Structure form
  const [structForm, setStructForm] = useState({
    className: '9',
    title: 'Class 9 Standard Fee Structure 2025-26',
    installments: [
      {
        installmentName: 'Term 1 (April)',
        dueDate: '2025-04-15',
        items: [{ feeHead: '', headName: 'Tuition Fee', amount: 6000 }]
      }
    ]
  });

  useEffect(() => {
    fetchData();
  }, [currentSession]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [headsRes, structsRes] = await Promise.all([
        api.get('/fees/heads'),
        api.get(`/fees/structures?session=${currentSession?.sessionName || '2025-26'}`)
      ]);
      if (headsRes.data.success) setFeeHeads(headsRes.data.data);
      if (structsRes.data.success) setStructures(structsRes.data.data);
    } catch (err) {
      toast.error('Failed to load fee configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHead = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/heads', headForm);
      if (res.data.success) {
        toast.success('Fee Head created');
        setHeadModalOpen(false);
        setHeadForm({ name: '', code: '', description: '', isOptional: false });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fee head');
    }
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/structures', {
        ...structForm,
        academicSession: currentSession?.sessionName || '2025-26'
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setStructModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save fee structure');
    }
  };

  const tabs = [
    { id: 'structures', label: 'Class Fee Structures', icon: Layers, badge: structures.length },
    { id: 'heads', label: 'Fee Heads Master', icon: CreditCard, badge: feeHeads.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Fee Structures & Rules
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Configure fee heads, class-wise installment schedules, due dates, and auto-sync student ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'structures' ? (
            <button
              onClick={() => setStructModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Class Fee</span>
            </button>
          ) : (
            <button
              onClick={() => setHeadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Fee Head</span>
            </button>
          )}
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: CLASS STRUCTURES */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          {structures.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No fee structures configured"
              description="Configure annual fee structures and installments for each class."
              actionLabel="Create Structure"
              onAction={() => setStructModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {structures.map((st) => (
                <div key={st._id} className="app-card p-6 space-y-4 hover:border-blue-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1">
                        Class {st.className}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{st.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-extrabold text-slate-400">Annual Total</p>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ₹{st.annualTotal?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Installment Breakdown ({st.installments?.length || 0} Terms)
                    </p>
                    {st.installments?.map((inst, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{inst.installmentName}</p>
                          <p className="text-[10px] text-slate-400">Due: {new Date(inst.dueDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <span className="font-black text-slate-800 dark:text-slate-200">
                          ₹{inst.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FEE HEADS MASTER */}
      {activeTab === 'heads' && (
        <div className="app-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131b2e]/60 font-extrabold uppercase text-slate-500 text-[11px]">
                <th className="py-3 px-4">Head Code</th>
                <th className="py-3 px-4">Fee Head Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Nature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {feeHeads.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{h.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{h.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{h.description || '-'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.isOptional ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {h.isOptional ? 'Optional Fee' : 'Mandatory Core'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Fee Head */}
      <Modal isOpen={headModalOpen} onClose={() => setHeadModalOpen(false)} title="Create New Fee Head">
        <form onSubmit={handleCreateHead} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fee Head Name *</label>
            <input
              type="text"
              required
              value={headForm.name}
              onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })}
              placeholder="e.g. Computer / Lab Fee"
              className="app-input w-full text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Short Code *</label>
            <input
              type="text"
              required
              value={headForm.code}
              onChange={(e) => setHeadForm({ ...headForm, code: e.target.value.toUpperCase() })}
              placeholder="e.g. COMP_FEE"
              className="app-input w-full text-xs font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={headForm.description}
              onChange={(e) => setHeadForm({ ...headForm, description: e.target.value })}
              placeholder="Description or applicability note"
              className="app-input w-full text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setHeadModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md"
            >
              Save Fee Head
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Fee Structure */}
      <Modal
        isOpen={structModalOpen}
        onClose={() => setStructModalOpen(false)}
        title="Configure Class Fee Structure"
        subtitle={`Session: ${currentSession?.sessionName || '2025-26'}`}
      >
        <form onSubmit={handleSaveStructure} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class *</label>
              <select
                value={structForm.className}
                onChange={(e) =>
                  setStructForm({
                    ...structForm,
                    className: e.target.value,
                    title: `Class ${e.target.value} Standard Fee Structure ${currentSession?.sessionName || '2025-26'}`
                  })
                }
                className="app-select w-full text-xs font-bold"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Structure Title *</label>
              <input
                type="text"
                required
                value={structForm.title}
                onChange={(e) => setStructForm({ ...structForm, title: e.target.value })}
                className="app-input w-full text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Installment Terms
              </label>
              <button
                type="button"
                onClick={() => {
                  setStructForm({
                    ...structForm,
                    installments: [
                      ...structForm.installments,
                      {
                        installmentName: `Term ${structForm.installments.length + 1}`,
                        dueDate: '2025-08-15',
                        items: [{ feeHead: feeHeads[0]?._id || '', headName: 'Tuition Fee', amount: 5000 }]
                      }
                    ]
                  });
                }}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Term
              </button>
            </div>

            {structForm.installments.map((inst, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Term Name</label>
                    <input
                      type="text"
                      required
                      value={inst.installmentName}
                      onChange={(e) => {
                        const updated = [...structForm.installments];
                        updated[i].installmentName = e.target.value;
                        setStructForm({ ...structForm, installments: updated });
                      }}
                      className="app-input w-full text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={inst.dueDate}
                      onChange={(e) => {
                        const updated = [...structForm.installments];
                        updated[i].dueDate = e.target.value;
                        setStructForm({ ...structForm, installments: updated });
                      }}
                      className="app-input w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Term Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={inst.items[0]?.amount || 5000}
                    onChange={(e) => {
                      const updated = [...structForm.installments];
                      updated[i].items = [{ feeHead: feeHeads[0]?._id || '', headName: 'Tuition Fee', amount: Number(e.target.value) }];
                      setStructForm({ ...structForm, installments: updated });
                    }}
                    className="app-input w-full text-xs font-black text-emerald-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStructModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md"
            >
              Save Structure & Sync Ledgers
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Layers, Plus, BookOpen, Sparkles } from 'lucide-react';

export default function SubjectCombinations() {
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCombinations = async () => {
      try {
        const res = await api.get('/subjects/combinations?className=11');
        if (res.data.success) {
          setCombinations(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCombinations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Subject Combinations (Class 11 Streams)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage stream-based elective combinations (Science, Commerce, Arts)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {combinations.map(combo => (
          <div key={combo._id} className="app-card p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">Class {combo.className} Track</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{combo.combinationName}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Code: {combo.combinationCode}</span>
              </div>
              <span className="app-badge-purple">
                {combo.streamName || 'Academic Stream'}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400">Compulsory Subjects:</span>
              <div className="space-y-1.5">
                {combo.compulsorySubjects?.map(s => (
                  <div key={s._id} className="app-card-subtle px-3 py-2 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900 dark:text-white">{s.subjectName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{s.totalMaxMarks} M</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

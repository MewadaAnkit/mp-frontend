import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AcademicContext = createContext(null);

const DEFAULT_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c, i) => ({
  _id: `cls-${c}`,
  className: c,
  displayName: `Class ${c}`,
  numericLevel: i + 1,
  order: i + 1
}));

const DEFAULT_SESSIONS = [
  { _id: 'sess-2025-26', sessionName: '2025-26', isCurrent: true, startDate: '2025-04-01', endDate: '2026-03-31' },
  { _id: 'sess-2026-27', sessionName: '2026-27', isCurrent: false, startDate: '2026-04-01', endDate: '2027-03-31' }
];

export const AcademicProvider = ({ children }) => {
  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [currentSession, setCurrentSession] = useState(DEFAULT_SESSIONS[0]);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMetadata = async () => {
    try {
      const [sessRes, clsRes, subRes, settRes] = await Promise.allSettled([
        api.get('/academic/sessions'),
        api.get('/academic/classes'),
        api.get('/subjects'),
        api.get('/settings')
      ]);

      if (sessRes.status === 'fulfilled' && sessRes.value.data.success && sessRes.value.data.data.length > 0) {
        setSessions(sessRes.value.data.data);
        const cur = sessRes.value.data.data.find(s => s.isCurrent) || sessRes.value.data.data[0];
        setCurrentSession(cur);
      }

      if (clsRes.status === 'fulfilled' && clsRes.value.data.success && clsRes.value.data.data.length > 0) {
        setClasses(clsRes.value.data.data);
      }

      if (subRes.status === 'fulfilled' && subRes.value.data.success && subRes.value.data.data.length > 0) {
        setSubjects(subRes.value.data.data);
      }

      if (settRes.status === 'fulfilled' && settRes.value.data.success) {
        setSettings(settRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch academic metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  return (
    <AcademicContext.Provider value={{
      sessions,
      currentSession,
      setCurrentSession,
      classes,
      subjects: subjects || [],
      settings,
      reloadMetadata: fetchMetadata,
      loading
    }}>
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => useContext(AcademicContext);

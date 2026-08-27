import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AcademicContext = createContext(null);

export const AcademicProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [classes, setClasses] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetadata = async () => {
    try {
      const [sessRes, clsRes, settRes] = await Promise.all([
        api.get('/academic/sessions'),
        api.get('/academic/classes'),
        api.get('/settings')
      ]);

      if (sessRes.data.success) {
        setSessions(sessRes.data.data);
        const cur = sessRes.data.data.find(s => s.isCurrent) || sessRes.data.data[0];
        setCurrentSession(cur);
      }

      if (clsRes.data.success) {
        setClasses(clsRes.data.data);
      }

      if (settRes.data.success) {
        setSettings(settRes.data.data);
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
      settings,
      reloadMetadata: fetchMetadata,
      loading
    }}>
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => useContext(AcademicContext);

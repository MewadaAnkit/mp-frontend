import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Trash2,
  FileText,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function HomeworkHub() {
  const { currentSession, classes, subjects: contextSubjects } = useAcademic();
  const { t, isHindi } = useLanguage();

  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedSection, setSelectedSection] = useState('A');
  const [homeworkList, setHomeworkList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: 'Mathematics',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Keep subjects safely loaded
  useEffect(() => {
    if (contextSubjects && Array.isArray(contextSubjects) && contextSubjects.length > 0) {
      setSubjectsList(contextSubjects);
    } else {
      api.get('/subjects')
        .then((res) => {
          if (res.data.success) setSubjectsList(res.data.data || []);
        })
        .catch(() => setSubjectsList([]));
    }
  }, [contextSubjects]);

  useEffect(() => {
    fetchHomework();
  }, [currentSession, selectedClass, selectedSection]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/homework?session=${currentSession?.sessionName || '2025-26'}&className=${selectedClass}&sectionName=${selectedSection}`
      );
      if (res.data.success) {
        setHomeworkList(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load homework assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/homework', {
        ...formData,
        academicSession: currentSession?.sessionName || '2025-26',
        className: selectedClass,
        sectionName: selectedSection
      });
      if (res.data.success) {
        toast.success(isHindi ? 'गृहकार्य सफलतापूर्वक पोस्ट किया गया' : 'Homework assignment posted!');
        setModalOpen(false);
        setFormData({
          subjectName: subjectsList[0]?.name || 'Mathematics',
          title: '',
          description: '',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        fetchHomework();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating homework');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isHindi ? 'क्या आप इस गृहकार्य को हटाना चाहते हैं?' : 'Delete this homework task?')) return;
    try {
      await api.delete(`/homework/${id}`);
      toast.success(isHindi ? 'गृहकार्य हटाया गया' : 'Homework task deleted');
      fetchHomework();
    } catch (err) {
      toast.error('Failed to delete homework');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('homework.title', 'Homework & Assignments Hub')}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t('homework.subtitle', 'Assign daily class tasks, track submission due dates, and share learning materials')}
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              subjectName: subjectsList[0]?.name || 'Mathematics',
              title: '',
              description: '',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('homework.assignNewBtn', 'Assign New Homework')}</span>
        </button>
      </div>

      {/* Selector Bar */}
      <div className="app-card p-4 flex items-center gap-4">
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            {t('common.class', 'Class')}
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="app-select text-xs font-bold min-w-[110px]"
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>
                {isHindi ? `कक्षा ${c}` : `Class ${c}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            {t('common.section', 'Section')}
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="app-select text-xs font-bold min-w-[90px]"
          >
            {['A', 'B', 'C', 'D'].map((s) => (
              <option key={s} value={s}>
                {isHindi ? `वर्ग ${s}` : `Sec ${s}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Homework Cards Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('common.loading', 'Loading homework assignments...')}
          </div>
        ) : homeworkList.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={isHindi ? `कक्षा ${selectedClass}-${selectedSection} के लिए कोई गृहकार्य पोस्ट नहीं है` : `No homework posted for Class ${selectedClass}-${selectedSection}`}
            description={isHindi ? 'शिक्षक दैनिक विषय असाइनमेंट और निर्देश पोस्ट कर सकते हैं।' : 'Teachers can post daily subject assignments and instructions.'}
            actionLabel={t('homework.assignNewBtn', 'Post Homework')}
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkList.map((hw) => {
              const isOverdue = new Date(hw.dueDate) < new Date();

              return (
                <div
                  key={hw._id}
                  className="app-card p-5 space-y-4 hover:border-blue-500/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                        {hw.subjectName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={isOverdue ? 'danger' : 'info'} size="xs">
                          {isOverdue ? t('homework.deadlinePassed', 'DEADLINE PASSED') : t('homework.active', 'ACTIVE')}
                        </Badge>
                        <button
                          onClick={() => handleDelete(hw._id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">{hw.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {hw.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>{hw.assignedByName || (isHindi ? 'कक्षा शिक्षक' : 'Class Faculty')}</span>
                    </span>

                    <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isHindi ? 'अंतिम तिथि:' : 'Due:'} {new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Post Homework */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('homework.assignNewBtn', 'Post Homework Assignment')}
        subtitle={`${isHindi ? 'कक्षा' : 'Class'} ${selectedClass}-${selectedSection} • ${t('common.session', 'Session')}: ${currentSession?.sessionName || '2025-26'}`}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('common.name', 'Subject')} *
              </label>
              <select
                required
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="app-select w-full text-xs font-bold"
              >
                {(subjectsList || []).map((sub) => (
                  <option key={sub._id || sub.code || sub.name} value={sub.name}>
                    {sub.name} {sub.code ? `(${sub.code})` : ''}
                  </option>
                ))}
                {(!subjectsList || subjectsList.length === 0) && (
                  <>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Social Science">Social Science</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('homework.dueDate', 'Submission Due Date')} *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="app-input w-full text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('homework.titleLabel', 'Assignment Title / Chapter')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isHindi ? 'उदा. अध्याय 4 द्विघात समीकरण प्रश्नावली 4.2' : 'e.g. Chapter 4 Quadratic Equations Exercise 4.2'}
              className="app-input w-full text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('homework.descriptionLabel', 'Instructions / Description')} *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isHindi ? 'छात्रों और अभिभावकों के लिए विस्तृत निर्देश लिखें...' : 'Write detailed homework instructions for students and parents...'}
              className="app-input w-full text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {t('homework.publishBtn', 'Publish Homework')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

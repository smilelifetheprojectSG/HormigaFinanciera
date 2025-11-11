import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SavingsList } from './components/SavingsList';
import { SavingsForm } from './components/SavingsForm';
import { GoalSetter } from './components/GoalSetter';
import { NotificationContainer } from './components/NotificationContainer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { useConceptManager } from './hooks/useConceptManager';
import { ConceptManager } from './components/ConceptManager';
import { ConfirmModal } from './components/ConfirmModal';
import type { SavingEntry, SavingsGoal } from './types';
import { GoalCard } from './components/GoalCard';
import { Confetti } from './components/Confetti';
import { ThemeProvider } from './contexts/ThemeContext';


function AppContent() {
  const [savings, setSavings] = useLocalStorage<SavingEntry[]>('savings', []);
  const [goal, setGoal] = useLocalStorage<SavingsGoal | null>('goal', null);
  const [notifiedMilestones, setNotifiedMilestones] = useLocalStorage<{ [key: string]: boolean }>('notifiedMilestones', {});
  
  const [isManageDayModalOpen, setManageDayModalOpen] = useState(false);
  const [isGoalSetterOpen, setIsGoalSetterOpen] = useState(false);
  const [isConceptManagerOpen, setConceptManagerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [isDeleteGoalModalOpen, setDeleteGoalModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { notifications, addNotification, dismissNotification } = useNotifications();
  const { concepts, addConcept, updateConcept, deleteConcept, reorderConcepts } = useConceptManager();


  useEffect(() => {
    if (!goal) return;

    const totalSaved = savings.reduce((sum, entry) => sum + entry.amount, 0);
    const goalProgress = goal.target > 0 ? (totalSaved / goal.target) * 100 : 0;

    const checkAndNotify = (key: string, condition: boolean, notification: { title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' }) => {
        if (condition && !notifiedMilestones[key]) {
            addNotification(notification);
            setNotifiedMilestones(prev => ({...prev, [key]: true}));
        }
    }

    // Goal reached
    checkAndNotify('goal_100', goalProgress >= 100, { title: '¡Meta Alcanzada!', message: `¡Felicidades! Has completado tu meta: "${goal.description}".`, type: 'success' });
    
    // Progress milestones (only show one, the highest one)
    if (goalProgress < 100) {
        checkAndNotify('goal_90', goalProgress >= 90, { title: '¡Ya casi!', message: 'Estás a más del 90% de tu meta. ¡Sigue así!', type: 'info' });
        checkAndNotify('goal_80', goalProgress >= 80 && goalProgress < 90, { title: '¡Estás cerca!', message: 'Has superado el 80% de tu meta.', type: 'info' });
    }

    // Deadline reminders
    if (goal.deadline) {
        const deadlineDate = new Date(goal.deadline);
        deadlineDate.setUTCHours(0,0,0,0);
        const todayDate = new Date();
        todayDate.setHours(0,0,0,0);
        const diffTime = deadlineDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && goalProgress < 100) {
            checkAndNotify('deadline_1', diffDays <= 1, { title: '¡Último día!', message: `Tu meta "${goal.description}" vence pronto.`, type: 'warning' });
            checkAndNotify('deadline_7', diffDays > 1 && diffDays <= 7, { title: 'Una semana restante', message: `Quedan 7 días o menos para tu meta.`, type: 'warning' });
        }
    }
  }, [savings, goal, addNotification, notifiedMilestones, setNotifiedMilestones]);

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date);
    setManageDayModalOpen(true);
  }, []);

  const handleCloseManageDayModal = () => {
    setManageDayModalOpen(false);
  };

  const handleSaveEntry = (entryData: (Omit<SavingEntry, 'id'> | SavingEntry) | (Omit<SavingEntry, 'id'> | SavingEntry)[]) => {
    const entriesToProcess = Array.isArray(entryData) ? entryData : [entryData];
    let newEntriesAdded = false;
    let hasPositiveAmount = false;

    setSavings(prev => {
        let updatedSavings = [...prev];
        
        for (const entry of entriesToProcess) {
            if ('id' in entry) {
                // Editing existing entry
                updatedSavings = updatedSavings.map(e => e.id === entry.id ? entry as SavingEntry : e);
            } else {
                // Adding new entry
                updatedSavings.push({ ...entry, id: uuidv4() });
                newEntriesAdded = true;
                if (entry.amount > 0) {
                    hasPositiveAmount = true;
                }
            }
        }
        
        return updatedSavings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    // Trigger confetti only for new entries with a positive amount. A withdrawal will trigger this.
    if (newEntriesAdded && hasPositiveAmount) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const requestDeleteEntry = useCallback((id: string) => {
    setDeleteCandidateId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteCandidateId) {
      setSavings(prev => prev.filter(entry => entry.id !== deleteCandidateId));
      setDeleteCandidateId(null);
    }
  }, [deleteCandidateId, setSavings]);


  const handleSaveGoal = (newGoal: SavingsGoal) => {
    // If goal is new or significantly different, reset milestones.
    if (!goal || newGoal.description !== goal.description || newGoal.target !== goal.target) {
      setNotifiedMilestones({});
    }
    setGoal(newGoal);
    setIsGoalSetterOpen(false);
  };

  const requestDeleteGoal = () => {
    setIsGoalSetterOpen(false);
    setDeleteGoalModalOpen(true);
  };
  
  const handleConfirmDeleteGoal = () => {
    setGoal(null);
    setNotifiedMilestones({});
    setDeleteGoalModalOpen(false);
  }

  // Concept Management Handlers
  const handleManageConcepts = () => {
    setManageDayModalOpen(false);
    setConceptManagerOpen(true);
  };

  const handleCloseConceptManager = () => {
    setConceptManagerOpen(false);
    setManageDayModalOpen(true); // Re-open the savings form
  };

  const handleUpdateConcept = (oldName: string, newName: string) => {
    // Update existing savings entries with the new concept name
    setSavings(prev => prev.map(s => s.description === oldName ? { ...s, description: newName } : s));
    updateConcept(oldName, newName);
  };

  const handleDeleteConcept = (name: string) => {
    // Re-categorize existing savings entries to 'Otro ingreso'
    setSavings(prev => prev.map(s => s.description === name ? { ...s, description: 'Otro ingreso' } : s));
    deleteConcept(name);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <Confetti isActive={showConfetti} />
      <Header />
      <main className="container mx-auto p-4 space-y-8">
        <Dashboard savings={savings} />
        <SavingsList 
            savings={savings} 
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
        />
        <GoalCard 
            savings={savings}
            goal={goal}
            onSetGoal={() => setIsGoalSetterOpen(true)}
        />
      </main>
      
      <NotificationContainer notifications={notifications} onDismiss={dismissNotification} />

      <SavingsForm
        isOpen={isManageDayModalOpen}
        onClose={handleCloseManageDayModal}
        onSave={handleSaveEntry}
        onDelete={requestDeleteEntry}
        date={selectedDate}
        allSavings={savings}
        concepts={concepts}
        onManageConcepts={handleManageConcepts}
      />
      <GoalSetter
        isOpen={isGoalSetterOpen}
        onClose={() => setIsGoalSetterOpen(false)}
        onSave={handleSaveGoal}
        onDelete={requestDeleteGoal}
        currentGoal={goal}
      />
      <ConceptManager
        isOpen={isConceptManagerOpen}
        onClose={handleCloseConceptManager}
        concepts={concepts}
        addConcept={addConcept}
        updateConcept={handleUpdateConcept}
        deleteConcept={handleDeleteConcept}
        reorderConcepts={reorderConcepts}
      />
       <ConfirmModal
        isOpen={!!deleteCandidateId}
        onClose={() => setDeleteCandidateId(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer."
      />
       <ConfirmModal
        isOpen={isDeleteGoalModalOpen}
        onClose={() => setDeleteGoalModalOpen(false)}
        onConfirm={handleConfirmDeleteGoal}
        title="Eliminar Meta"
        message="¿Estás seguro de que quieres eliminar tu meta de ahorro? Tu progreso hacia esta meta se perderá."
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}


export default App;

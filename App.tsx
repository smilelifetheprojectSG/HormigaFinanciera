
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
import { TopApps } from './components/TopApps';
import { PeriodComparer } from './components/PeriodComparer';
import { Confetti } from './components/Confetti';
import { ThemeProvider } from './contexts/ThemeContext';
import { Welcome } from './components/Welcome';
import { DataExporter } from './components/DataExporter';
import { AITip } from './components/AITip';
import { BottomNavbar } from './components/BottomNavbar';

type View = 'home' | 'movements' | 'analysis' | 'settings';

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
  const [savingsToImport, setSavingsToImport] = useState<SavingEntry[] | null>(null);
  const [activeView, setActiveView] = useState<View>('home');
  
  const { notifications, addNotification, dismissNotification } = useNotifications();
  const { concepts, addConcept, updateConcept, deleteConcept, reorderConcepts } = useConceptManager();


  const totalSaved = savings.reduce((sum, entry) => sum + entry.amount, 0);

  useEffect(() => {
    if (!goal) return;

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

    // Deadline reminders (calculated dynamically)
    const remainingAmount = goal.target - totalSaved;
    let diffDays = -1;
    if (remainingAmount > 0 && goal.dailyAmount > 0) {
        diffDays = Math.ceil(remainingAmount / goal.dailyAmount);
    }
    
    if (diffDays >= 0 && goalProgress < 100) {
        checkAndNotify('deadline_1', diffDays <= 1, { title: '¡Último día!', message: `Tu meta "${goal.description}" vence pronto.`, type: 'warning' });
        checkAndNotify('deadline_7', diffDays > 1 && diffDays <= 7, { title: 'Una semana restante', message: `Quedan 7 días o menos para tu meta.`, type: 'warning' });
    }
  }, [savings, goal, addNotification, notifiedMilestones, setNotifiedMilestones, totalSaved]);

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date);
    setManageDayModalOpen(true);
  }, []);
  
  const handleFabClick = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    setSelectedDate(todayStr);
    setManageDayModalOpen(true);
  }, [setSelectedDate]);

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
  
  const handleConfirmImport = () => {
    if (savingsToImport) {
        // Sort by date just like the original save function does
        const sortedSavings = [...savingsToImport].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSavings(sortedSavings);
        addNotification({ title: 'Importación Completa', message: 'Tus datos se han cargado correctamente.', type: 'success' });
    }
    setSavingsToImport(null);
  };

  const handleImportRequest = (data: SavingEntry[]) => {
      setSavingsToImport(data);
  };

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

  const renderView = () => {
    const key = `${activeView}-${savings.length}`; // Force re-render on view change or data change for animations
    switch (activeView) {
      case 'home':
        return (
          <div key={key} className="space-y-8 animate-fade-in-up">
            <Dashboard savings={savings} />
            <GoalCard goal={goal} savings={savings} onSetGoal={() => setIsGoalSetterOpen(true)} />
            <AITip savings={savings} />
          </div>
        );
      case 'movements':
        return (
          <div key={key} className="animate-fade-in-up">
            <SavingsList savings={savings} selectedDate={selectedDate} onDayClick={handleDayClick} />
          </div>
        );
      case 'analysis':
        return (
          <div key={key} className="space-y-8 animate-fade-in-up">
             <h2 className="text-xl font-bold text-primary-dark">Análisis de Ahorros</h2>
            <TopApps savings={savings} />
            <PeriodComparer savings={savings} />
          </div>
        );
      case 'settings':
        return (
          <div key={key} className="space-y-8 animate-fade-in-up">
            <DataExporter savings={savings} onImportRequest={handleImportRequest} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Scrollable content area */}
      <div className="min-h-screen bg-background text-text-primary pb-32">
        <Header />
        <main className="container mx-auto p-4 space-y-8">
          <Welcome />
          {renderView()}
        </main>
      </div>
      
      {/* Fixed/Overlay elements */}
      <Confetti isActive={showConfetti} />
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
        totalSaved={totalSaved}
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
       <ConfirmModal
        isOpen={!!savingsToImport}
        onClose={() => setSavingsToImport(null)}
        onConfirm={handleConfirmImport}
        title="Confirmar Importación"
        message="Esto reemplazará todos tus datos actuales con los del archivo. Esta acción no se puede deshacer."
        confirmButtonText="Sí, Importar"
        confirmButtonClass="bg-primary hover:bg-primary-dark"
      />
      <BottomNavbar
        activeView={activeView}
        onNavigate={setActiveView}
        onAddClick={handleFabClick}
      />
    </>
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

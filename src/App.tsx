
import React, { useState, useEffect } from 'react';
import WorkPermitForm from './components/WorkPermitForm';
import SummaryPage from './components/SummaryPage';
import DashboardPage from './components/DashboardPage';
import PermitDetailModal from './components/PermitDetailModal';
import type { SubmittedWorkPermitData, WorkPermitRequest } from './types';

const App: React.FC = () => {
  const [workPermits, setWorkPermits] = useState<SubmittedWorkPermitData[]>([]);
  const [view, setView] = useState<'dashboard' | 'form' | 'summary'>('dashboard');
  const [currentPermit, setCurrentPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [editingPermit, setEditingPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [viewingPermit, setViewingPermit] = useState<SubmittedWorkPermitData | null>(null);

  useEffect(() => {
    try {
      const storedPermits = localStorage.getItem('workPermits');
      if (storedPermits) {
        // Dates need to be re-hydrated into Date objects
        const parsedPermits = JSON.parse(storedPermits).map((p: any) => ({
          ...p,
          submissionTimestamp: new Date(p.submissionTimestamp),
        }));
        setWorkPermits(parsedPermits);
      }
    } catch (error) {
      console.error("Failed to load permits from localStorage", error);
      setWorkPermits([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('workPermits', JSON.stringify(workPermits));
    } catch (error) {
      console.error("Failed to save permits to localStorage", error);
    }
  }, [workPermits]);


  const generateDocumentId = (): string => {
    const now = new Date();
    const buddhistYear = now.getFullYear() + 543;
    const shortYear = buddhistYear.toString().slice(-2);

    const storageKey = `workPermitCounter_${buddhistYear}`;
    let currentCount = 1;

    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const { year, count } = JSON.parse(storedData);
        if (year === buddhistYear) {
          currentCount = count + 1;
        }
      }
      localStorage.setItem(storageKey, JSON.stringify({ year: buddhistYear, count: currentCount }));
    } catch (error) {
      console.error("Could not access localStorage for counter:", error);
      currentCount = workPermits.filter(p => p.documentId.includes(`-${shortYear}-`)).length + 1;
    }
    
    const sequenceNumber = currentCount.toString().padStart(4, '0');
    
    return `C2-${shortYear}-${sequenceNumber}`;
  };

  const handleFormSubmit = (data: WorkPermitRequest) => {
    let submittedData: SubmittedWorkPermitData;
    if (editingPermit) {
      // Update existing permit
      submittedData = { 
        ...editingPermit, 
        ...data, 
        submissionTimestamp: new Date() // Update timestamp on edit
      };
      setWorkPermits(permits => permits.map(p => p.documentId === editingPermit.documentId ? submittedData : p));
    } else {
      // Create new permit
      submittedData = {
        ...data,
        documentId: generateDocumentId(),
        submissionTimestamp: new Date(),
      };
      setWorkPermits(permits => [...permits, submittedData]);
    }
    
    setCurrentPermit(submittedData);
    setEditingPermit(null);
    setView('summary');
    window.scrollTo(0, 0);
  };

  const handleCreateNew = () => {
    setEditingPermit(null);
    setView('form');
  };

  const handleEdit = (documentId: string) => {
    const permitToEdit = workPermits.find(p => p.documentId === documentId);
    if (permitToEdit) {
      setEditingPermit(permitToEdit);
      setView('form');
    }
  };

  const handleViewDetails = (documentId: string) => {
    const permitToView = workPermits.find(p => p.documentId === documentId);
    if (permitToView) {
      setViewingPermit(permitToView);
    }
  };

  const handleCloseDetails = () => {
    setViewingPermit(null);
  };

  const handleGoToDashboard = () => {
    setEditingPermit(null);
    setCurrentPermit(null);
    setView('dashboard');
  };

  const renderContent = () => {
    switch(view) {
      case 'form':
        return <WorkPermitForm 
                  onSubmitSuccess={handleFormSubmit} 
                  initialData={editingPermit} 
                  onCancel={handleGoToDashboard} 
               />;
      case 'summary':
        return currentPermit ? <SummaryPage data={currentPermit} onGoToDashboard={handleGoToDashboard} /> : null;
      case 'dashboard':
      default:
        return <DashboardPage 
                  permits={workPermits} 
                  onCreateNew={handleCreateNew} 
                  onEdit={handleEdit}
                  onViewDetails={handleViewDetails}
               />;
    }
  };
  
  return (
    <div className="min-h-screen bg-purple-50 font-sans text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            ใบขออนุญาตเข้าปฏิบัติงานในห้อง Datacenter
          </h1>
          <p className="text-sm text-gray-600 mt-1">Datacenter Work Permit Request Form</p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Datacenter Operations | ISO Standards Compliance</p>
      </footer>
      {viewingPermit && <PermitDetailModal permit={viewingPermit} onClose={handleCloseDetails} />}
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import WorkPermitForm from './components/WorkPermitForm';
import SummaryPage from './components/SummaryPage';
import DashboardPage from './components/DashboardPage';
import PermitDetailModal from './components/PermitDetailModal';
import type { SubmittedWorkPermitData, WorkPermitRequest } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [workPermits, setWorkPermits] = useState<SubmittedWorkPermitData[]>([]);
  const [view, setView] = useState<'dashboard' | 'form' | 'summary'>('dashboard');
  const [currentPermit, setCurrentPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [editingPermit, setEditingPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [viewingPermit, setViewingPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format ISO string from DB (UTC) to local datetime string for input (YYYY-MM-DDTHH:mm)
  const toLocalInputDate = (isoString: string | undefined | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Adjust for timezone offset to get the correct string representation for local time input
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('work_permits')
        .select('*')
        .order('submission_timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map snake_case from DB to camelCase for App
        const mappedData: SubmittedWorkPermitData[] = data.map((item: any) => ({
          documentId: item.document_id,
          reason: item.reason,
          // Convert UTC timestamp from DB to Local Input Format for editing compatibility
          entryDateTime: toLocalInputDate(item.entry_date_time),
          personnel: item.personnel,
          equipmentIn: item.equipment_in || '',
          equipmentOut: item.equipment_out || '',
          submissionTimestamp: new Date(item.submission_timestamp),
        }));
        setWorkPermits(mappedData);
      }
    } catch (err: any) {
      console.error("Error fetching permits:", err);
      setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocumentId = async (): Promise<string> => {
    const now = new Date();
    const buddhistYear = now.getFullYear() + 543;
    const shortYear = buddhistYear.toString().slice(-2);
    
    // Query DB to count permits for this year to generate sequential ID
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();

    try {
      const { count, error } = await supabase
        .from('work_permits')
        .select('*', { count: 'exact', head: true })
        .gte('submission_timestamp', startOfYear)
        .lte('submission_timestamp', endOfYear);

      if (error) throw error;
      
      const currentCount = (count || 0) + 1;
      const sequenceNumber = currentCount.toString().padStart(4, '0');
      return `C2-${shortYear}-${sequenceNumber}`;

    } catch (error) {
      console.error("Error generating ID:", error);
      // Fallback logic purely client-side if DB fails (safe-fail)
      return `C2-${shortYear}-${Date.now().toString().slice(-4)}`;
    }
  };

  const handleFormSubmit = async (data: WorkPermitRequest) => {
    setIsLoading(true);
    setError(null);

    // Convert Local Input Time to UTC ISO String for DB consistency
    const entryDateISO = new Date(data.entryDateTime).toISOString();

    try {
      let submittedData: SubmittedWorkPermitData;

      if (editingPermit) {
        // UPDATE Existing Permit
        const { error } = await supabase
          .from('work_permits')
          .update({
            reason: data.reason,
            entry_date_time: entryDateISO,
            personnel: data.personnel, // JSONB auto handles array
            equipment_in: data.equipmentIn,
            equipment_out: data.equipmentOut,
            // submission_timestamp usually shouldn't change on edit, preserving original creation time
          })
          .eq('document_id', editingPermit.documentId);

        if (error) throw error;

        submittedData = {
          ...editingPermit,
          ...data,
        };
        
        // Optimistic update locally
        setWorkPermits(permits => permits.map(p => p.documentId === editingPermit.documentId ? submittedData : p));

      } else {
        // CREATE New Permit
        const newDocId = await generateDocumentId();
        const timestamp = new Date();

        const { error } = await supabase
          .from('work_permits')
          .insert([
            {
              document_id: newDocId,
              reason: data.reason,
              entry_date_time: entryDateISO,
              personnel: data.personnel,
              equipment_in: data.equipmentIn,
              equipment_out: data.equipmentOut,
              submission_timestamp: timestamp.toISOString()
            }
          ]);

        if (error) throw error;

        submittedData = {
          ...data,
          documentId: newDocId,
          submissionTimestamp: timestamp,
        };

        // Optimistic update locally
        setWorkPermits(permits => [submittedData, ...permits]);
      }
      
      setCurrentPermit(submittedData);
      setEditingPermit(null);
      setView('summary');
      window.scrollTo(0, 0);

    } catch (err: any) {
      console.error("Error saving permit:", err);
      setError(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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
    // Refresh data when going back to dashboard to ensure sync
    fetchPermits();
    setView('dashboard');
  };

  const renderContent = () => {
    if (isLoading && workPermits.length === 0 && view === 'dashboard') {
       return (
         <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
         </div>
       );
    }

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
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
             <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            ใบขออนุญาตเข้าปฏิบัติงาน
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Datacenter Work Permit System</p>
          </div>
          {/* Show loading indicator in header if background updating */}
          {isLoading && workPermits.length > 0 && (
            <div className="text-sm text-purple-600 animate-pulse font-medium">
              Updating...
            </div>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Datacenter Operations | Database: Supabase (PostgreSQL)</p>
      </footer>
      {viewingPermit && <PermitDetailModal permit={viewingPermit} onClose={handleCloseDetails} />}
      
      {/* Full screen loader overlay when submitting form */}
      {isLoading && view === 'form' && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center">
             <div className="bg-white p-5 rounded-lg shadow-xl flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-3"></div>
                <span className="text-gray-700 font-medium">กำลังบันทึกข้อมูล...</span>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;
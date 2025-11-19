
import React, { useState, useEffect } from 'react';
import WorkPermitForm from './components/WorkPermitForm';
import SummaryPage from './components/SummaryPage';
import DashboardPage from './components/DashboardPage';
import PermitDetailModal from './components/PermitDetailModal';
import type { SubmittedWorkPermitData, WorkPermitRequest, Personnel } from './types';
import { supabase } from './lib/supabaseClient';
import { PersonType } from './types';

const App: React.FC = () => {
  const [workPermits, setWorkPermits] = useState<SubmittedWorkPermitData[]>([]);
  const [view, setView] = useState<'dashboard' | 'form' | 'summary'>('dashboard');
  const [currentPermit, setCurrentPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [editingPermit, setEditingPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [viewingPermit, setViewingPermit] = useState<SubmittedWorkPermitData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchWorkPermits();
  }, []);

  const fetchWorkPermits = async () => {
    setIsLoading(true);
    try {
      // Fetch permits and join with personnel
      const { data, error } = await supabase
        .from('work_permits')
        .select(`
          *,
          permit_personnel (*)
        `)
        .order('submission_timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: SubmittedWorkPermitData[] = data.map((item: any) => ({
          id: item.id,
          documentId: item.document_id,
          reason: item.reason,
          entryDateTime: item.entry_date_time, // Supabase returns ISO string
          submissionTimestamp: new Date(item.submission_timestamp),
          equipmentIn: item.equipment_in,
          equipmentOut: item.equipment_out,
          personnel: item.permit_personnel.map((p: any) => ({
            id: p.id,
            type: p.type as PersonType,
            employeeId: p.employee_id || '',
            fullName: p.full_name || '',
            company: p.company || '',
            nationalId: p.national_id || '',
          })),
        }));
        setWorkPermits(formattedData);
      }
    } catch (error) {
      console.error("Error fetching work permits:", error);
      alert("ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocumentId = async (): Promise<string> => {
    const now = new Date();
    const buddhistYear = now.getFullYear() + 543;
    const shortYear = buddhistYear.toString().slice(-2);
    const prefix = `C2-${shortYear}-`;

    // Count existing documents for this year to generate next sequence
    // Note: In high concurrency, this might need a database function/sequence
    const { count, error } = await supabase
      .from('work_permits')
      .select('*', { count: 'exact', head: true })
      .ilike('document_id', `${prefix}%`);

    if (error) {
      console.error("Error counting documents:", error);
      // Fallback to local length if DB fails, though risk of collision
      const localCount = workPermits.filter(p => p.documentId.startsWith(prefix)).length;
      return `${prefix}${(localCount + 1).toString().padStart(4, '0')}`;
    }

    const nextSequence = ((count || 0) + 1).toString().padStart(4, '0');
    return `${prefix}${nextSequence}`;
  };

  const handleFormSubmit = async (data: WorkPermitRequest) => {
    setIsLoading(true);
    try {
      if (editingPermit && editingPermit.id) {
        // --- UPDATE Existing Permit ---
        
        // 1. Update Header
        const { error: updateError } = await supabase
          .from('work_permits')
          .update({
            reason: data.reason,
            entry_date_time: data.entryDateTime,
            equipment_in: data.equipmentIn,
            equipmentOut: data.equipmentOut,
            // submission_timestamp usually stays same, or update a separate 'updated_at'
          })
          .eq('id', editingPermit.id);

        if (updateError) throw updateError;

        // 2. Update Personnel (Strategy: Delete all for this permit, then Re-insert)
        const { error: deleteError } = await supabase
          .from('permit_personnel')
          .delete()
          .eq('permit_id', editingPermit.id);
          
        if (deleteError) throw deleteError;

        const personnelToInsert = data.personnel.map(p => ({
          permit_id: editingPermit.id,
          type: p.type,
          employee_id: p.type === PersonType.INTERNAL ? p.employeeId : null,
          full_name: p.type === PersonType.EXTERNAL ? p.fullName : null,
          company: p.type === PersonType.EXTERNAL ? p.company : null,
          national_id: p.type === PersonType.EXTERNAL ? p.nationalId : null,
        }));

        if (personnelToInsert.length > 0) {
           const { error: insertPError } = await supabase
            .from('permit_personnel')
            .insert(personnelToInsert);
           if (insertPError) throw insertPError;
        }

        // Update Local State
        const updatedPermit: SubmittedWorkPermitData = {
            ...editingPermit,
            ...data,
            submissionTimestamp: new Date() // Just for display
        };
        setWorkPermits(prev => prev.map(p => p.id === editingPermit.id ? updatedPermit : p));
        setCurrentPermit(updatedPermit);

      } else {
        // --- CREATE New Permit ---
        const newDocId = await generateDocumentId();
        
        // 1. Insert Header
        const { data: insertedPermit, error: insertError } = await supabase
          .from('work_permits')
          .insert({
            document_id: newDocId,
            reason: data.reason,
            entry_date_time: data.entryDateTime,
            equipment_in: data.equipmentIn,
            equipment_out: data.equipmentOut,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (!insertedPermit) throw new Error("Failed to retrieve inserted permit");

        const newPermitId = insertedPermit.id;

        // 2. Insert Personnel
        const personnelToInsert = data.personnel.map(p => ({
          permit_id: newPermitId,
          type: p.type,
          employee_id: p.type === PersonType.INTERNAL ? p.employeeId : null,
          full_name: p.type === PersonType.EXTERNAL ? p.fullName : null,
          company: p.type === PersonType.EXTERNAL ? p.company : null,
          national_id: p.type === PersonType.EXTERNAL ? p.nationalId : null,
        }));

        if (personnelToInsert.length > 0) {
          const { error: insertPError } = await supabase
            .from('permit_personnel')
            .insert(personnelToInsert);
          if (insertPError) throw insertPError;
        }

        const newSubmittedData: SubmittedWorkPermitData = {
            id: newPermitId,
            documentId: newDocId,
            submissionTimestamp: new Date(insertedPermit.submission_timestamp),
            ...data
        };

        setWorkPermits(prev => [newSubmittedData, ...prev]);
        setCurrentPermit(newSubmittedData);
      }
      
      // Reset View
      setEditingPermit(null);
      setView('summary');
      window.scrollTo(0, 0);

    } catch (error: any) {
      console.error("Error saving permit:", error);
      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message || 'Unknown error'}`);
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
    setView('dashboard');
    // Optional: Refresh data when returning to dashboard
    fetchWorkPermits(); 
  };

  const renderContent = () => {
    if (isLoading && view === 'dashboard' && workPermits.length === 0) {
       return (
         <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            ใบขออนุญาตเข้าปฏิบัติงานในห้อง Datacenter
          </h1>
          <p className="text-sm text-gray-600 mt-1">Datacenter Work Permit Request Form</p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && view !== 'dashboard' && (
             <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-600"></div>
                    <span className="text-gray-700">กำลังบันทึกข้อมูล...</span>
                </div>
             </div>
        )}
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

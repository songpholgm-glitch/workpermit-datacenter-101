
import React from 'react';
import type { SubmittedWorkPermitData } from '../types';
import { FilePlusIcon } from './icons/FilePlusIcon';
import { EditIcon } from './icons/EditIcon';

interface DashboardPageProps {
  permits: SubmittedWorkPermitData[];
  onCreateNew: () => void;
  onEdit: (documentId: string) => void;
  onViewDetails: (documentId: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ permits, onCreateNew, onEdit, onViewDetails }) => {

  const sortedPermits = [...permits].sort((a, b) => b.submissionTimestamp.getTime() - a.submissionTimestamp.getTime());

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">รายการใบขออนุญาตทั้งหมด</h2>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition"
        >
          <FilePlusIcon />
          สร้างใบขออนุญาตใหม่
        </button>
      </div>

      {sortedPermits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPermits.map((permit) => (
            <div key={permit.documentId} className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div>
                <div className="flex justify-between items-start">
                  <button 
                    onClick={() => onViewDetails(permit.documentId)}
                    className="font-bold text-lg text-purple-700 hover:text-purple-900 hover:underline transition text-left"
                    aria-label={`View details for permit ${permit.documentId}`}
                  >
                    {permit.documentId}
                  </button>
                   <button 
                    onClick={() => onEdit(permit.documentId)} 
                    className="text-gray-400 hover:text-purple-600 transition"
                    aria-label={`Edit permit ${permit.documentId}`}
                  >
                    <EditIcon />
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  <strong className="text-gray-800">เหตุผล:</strong> 
                  <span className="line-clamp-2">{permit.reason}</span>
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  <strong className="text-gray-800">วันที่ขอเข้า:</strong> {formatDate(permit.entryDateTime)}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  <strong className="text-gray-800">จำนวนผู้ปฏิบัติงาน:</strong> {permit.personnel.length} คน
                </p>
              </div>
              <div className="mt-4 text-xs text-gray-400 text-right pt-2 border-t border-gray-100">
                สร้างเมื่อ: {formatDate(permit.submissionTimestamp)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-white">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">ยังไม่มีใบขออนุญาต</h3>
          <p className="mt-1 text-sm text-gray-500">เริ่มต้นโดยการสร้างใบขออนุญาตใหม่</p>
          <div className="mt-6">
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition"
            >
              <FilePlusIcon />
              สร้างใบขออนุญาตใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

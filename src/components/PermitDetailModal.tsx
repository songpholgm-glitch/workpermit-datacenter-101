
import React from 'react';
import type { SubmittedWorkPermitData } from '../types';
import { PersonType } from '../types';
import { XIcon } from './icons/XIcon';

interface PermitDetailModalProps {
  permit: SubmittedWorkPermitData;
  onClose: () => void;
}

const DetailSection: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <div className="mt-1 text-md text-gray-900">{children}</div>
    </div>
);


const PermitDetailModal: React.FC<PermitDetailModalProps> = ({ permit, onClose }) => {

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        รายละเอียดใบอนุญาต: <span className="text-purple-700">{permit.documentId}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailSection label="เวลาที่ส่งคำขอ">
                           {formatDate(permit.submissionTimestamp)}
                        </DetailSection>
                        <DetailSection label="วันที่และเวลาเข้าปฏิบัติงานที่ร้องขอ">
                           <span className="font-semibold text-purple-700">{formatDate(permit.entryDateTime)}</span>
                        </DetailSection>
                    </div>
                    
                    <DetailSection label="วัตถุประสงค์">
                        <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{permit.reason}</p>
                    </DetailSection>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">รายชื่อผู้ปฏิบัติงาน ({permit.personnel.length} คน)</h3>
                        <ul role="list" className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                            {permit.personnel.map((person, index) => (
                                <li key={person.id} className="flex items-center justify-between py-3 px-4 text-sm">
                                   <div className="flex items-center gap-3">
                                        <span className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">{index + 1}</span>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {person.type === PersonType.INTERNAL ? `รหัสพนักงาน: ${person.employeeId}` : person.fullName}
                                            </p>
                                            <p className="text-gray-500">
                                                {person.type === PersonType.EXTERNAL ? `${person.company} (เลขประจำตัว: ${person.nationalId})` : 'พนักงานภายใน'}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailSection label="อุปกรณ์ที่นำเข้า">
                            <pre className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap font-sans h-32 overflow-y-auto">{permit.equipmentIn || 'ไม่มี'}</pre>
                        </DetailSection>
                        <DetailSection label="อุปกรณ์ที่นำออก">
                            <pre className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap font-sans h-32 overflow-y-auto">{permit.equipmentOut || 'ไม่มี'}</pre>
                        </DetailSection>
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl text-right">
                     <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition"
                        >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermitDetailModal;

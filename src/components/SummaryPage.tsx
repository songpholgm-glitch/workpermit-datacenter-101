
import React from 'react';
import type { SubmittedWorkPermitData } from '../types';
import { PersonType } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SummaryPageProps {
  data: SubmittedWorkPermitData;
  onGoToDashboard: () => void;
}

const SummaryDetail: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <div className="mt-1 text-md text-gray-900">{children}</div>
    </div>
);

const SummaryPage: React.FC<SummaryPageProps> = ({ data, onGoToDashboard }) => {
  
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
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="text-center border-b border-gray-200 pb-4 mb-6">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-2 text-2xl font-bold leading-9 tracking-tight text-gray-900">ส่งคำขอเรียบร้อยแล้ว</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">นี่คือสรุปข้อมูลคำขอของคุณ</p>
        </div>

        <div className="space-y-6">
            <SummaryDetail label="หมายเลขเอกสาร (Document ID)">
                <span className="font-bold text-lg text-purple-700 tracking-wider bg-purple-50 px-3 py-1 rounded-md">{data.documentId}</span>
            </SummaryDetail>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SummaryDetail label="เวลาที่ส่งคำขอ">
                   {formatDate(data.submissionTimestamp)}
                </SummaryDetail>
                <SummaryDetail label="วันที่และเวลาเข้าปฏิบัติงานที่ร้องขอ">
                   <span className="font-semibold text-purple-700">{formatDate(data.entryDateTime)}</span>
                </SummaryDetail>
            </div>
            
            <SummaryDetail label="วัตถุประสงค์">
                <p className="whitespace-pre-wrap">{data.reason}</p>
            </SummaryDetail>

            <div>
                <h3 className="text-sm font-medium text-gray-500">รายชื่อผู้ปฏิบัติงาน ({data.personnel.length} คน)</h3>
                <ul role="list" className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                    {data.personnel.map((person, index) => (
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
                <SummaryDetail label="อุปกรณ์ที่นำเข้า">
                    <pre className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap font-sans">{data.equipmentIn || 'ไม่มี'}</pre>
                </SummaryDetail>
                <SummaryDetail label="อุปกรณ์ที่นำออก">
                    <pre className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap font-sans">{data.equipmentOut || 'ไม่มี'}</pre>
                </SummaryDetail>
            </div>
        </div>

        <div className="mt-8 flex items-center justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onGoToDashboard}
              className="rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition"
            >
              กลับไปหน้าหลัก
            </button>
        </div>
    </div>
  );
};

export default SummaryPage;

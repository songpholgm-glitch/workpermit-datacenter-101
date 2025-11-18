
import React, { useState, useCallback, useEffect } from 'react';
import type { WorkPermitRequest, Personnel, SubmittedWorkPermitData } from '../types';
import { PersonType } from '../types';
import PersonnelInput from './PersonnelInput';
import { PlusIcon } from './icons/PlusIcon';

interface WorkPermitFormProps {
  onSubmitSuccess: (data: WorkPermitRequest) => void;
  initialData?: SubmittedWorkPermitData | null;
  onCancel: () => void;
}

const WorkPermitForm: React.FC<WorkPermitFormProps> = ({ onSubmitSuccess, initialData, onCancel }) => {
  const [formData, setFormData] = useState<WorkPermitRequest>({
    reason: '',
    entryDateTime: '',
    personnel: [],
    equipmentIn: '',
    equipmentOut: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        reason: initialData.reason,
        entryDateTime: initialData.entryDateTime,
        personnel: initialData.personnel,
        equipmentIn: initialData.equipmentIn,
        equipmentOut: initialData.equipmentOut,
      });
    }
  }, [initialData]);

  const handleAddPersonnel = useCallback(() => {
    const newPerson: Personnel = {
      id: crypto.randomUUID(),
      type: PersonType.INTERNAL,
      employeeId: '',
      fullName: '',
      company: '',
      nationalId: '',
    };
    setFormData(prev => ({
      ...prev,
      personnel: [...prev.personnel, newPerson]
    }));
  }, []);

  const handleRemovePersonnel = useCallback((idToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      personnel: prev.personnel.filter(p => p.id !== idToRemove)
    }));
  }, []);

  const handlePersonnelChange = useCallback((idToUpdate: string, updatedPerson: Personnel) => {
    setFormData(prev => ({
      ...prev,
      personnel: prev.personnel.map(p => p.id === idToUpdate ? updatedPerson : p)
    }));
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSuccess(formData);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
      
      {/* Reason for Entry */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">1. วัตถุประสงค์ (Reason for Entry)</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">โปรดระบุเหตุผลและรายละเอียดการเข้าปฏิบัติงาน</p>
        <div className="mt-4">
          <textarea
            id="reason"
            name="reason"
            rows={4}
            className="block w-full rounded-md border-0 bg-white py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 transition"
            value={formData.reason}
            onChange={handleInputChange}
            required
            placeholder="เช่น: ติดตั้ง Server Rack ใหม่, ตรวจสอบระบบ Network, PM ระบบปรับอากาศ"
          />
        </div>
      </div>

      {/* Date and Time Section */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">2. วันและเวลาเข้าปฏิบัติงาน (Date and Time of Entry)</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">โปรดระบุวันที่และเวลาที่ต้องการเข้าพื้นที่</p>
        <div className="mt-4 max-w-sm">
          <input
            type="datetime-local"
            id="entryDateTime"
            name="entryDateTime"
            value={formData.entryDateTime}
            onChange={handleInputChange}
            required
            className="block w-full rounded-md border-0 bg-white py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 transition"
            min={getMinDateTime()}
          />
        </div>
      </div>

      {/* Personnel Section */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold leading-7 text-gray-900">3. รายชื่อผู้ปฏิบัติงาน (Personnel)</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">เพิ่มรายชื่อบุคคลทั้งหมดที่ต้องการเข้าห้อง Datacenter</p>
          </div>
          <button
            type="button"
            onClick={handleAddPersonnel}
            className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition"
          >
            <PlusIcon />
            เพิ่มบุคคล
          </button>
        </div>
        <div className="mt-6 space-y-6">
          {formData.personnel.length > 0 ? (
            formData.personnel.map((person) => (
              <PersonnelInput
                key={person.id}
                person={person}
                onChange={handlePersonnelChange}
                onRemove={handleRemovePersonnel}
              />
            ))
          ) : (
             <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">ยังไม่มีรายชื่อผู้ปฏิบัติงาน</p>
                <p className="text-sm text-gray-400">คลิก "เพิ่มบุคคล" เพื่อเริ่ม</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Equipment Section */}
      <div className="pb-6">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">4. อุปกรณ์ (Equipment)</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">ระบุรายการอุปกรณ์ทั้งหมดที่จะนำเข้าและนำออกจากห้อง Datacenter</p>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
          <div>
            <label htmlFor="equipmentIn" className="block text-sm font-medium leading-6 text-gray-900">
              อุปกรณ์ที่นำเข้า (Items In)
            </label>
            <div className="mt-2">
              <textarea
                id="equipmentIn"
                name="equipmentIn"
                rows={4}
                className="block w-full rounded-md border-0 bg-white py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 transition"
                value={formData.equipmentIn}
                onChange={handleInputChange}
                placeholder="- Server Dell R740 S/N: XXXXX&#10;- Laptop S/N: YYYYY&#10;- Network Switch Cisco S/N: ZZZZZ"
              />
            </div>
          </div>
          <div>
            <label htmlFor="equipmentOut" className="block text-sm font-medium leading-6 text-gray-900">
              อุปกรณ์ที่นำออก (Items Out)
            </label>
            <div className="mt-2">
              <textarea
                id="equipmentOut"
                name="equipmentOut"
                rows={4}
                className="block w-full rounded-md border-0 bg-white py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 transition"
                value={formData.equipmentOut}
                onChange={handleInputChange}
                 placeholder="- Server HP DL380 S/N: AAAAA (Decommissioned)&#10;- Hard Disk S/N: BBBBB"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Submission Buttons */}
      <div className="mt-8 flex items-center justify-end gap-x-6 pt-6 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">
          ยกเลิก
        </button>
        <button
          type="submit"
          className="rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition disabled:bg-gray-400"
          disabled={formData.personnel.length === 0 || !formData.reason || !formData.entryDateTime}
        >
          {isEditing ? 'อัปเดตข้อมูล (Update Request)' : 'ส่งคำขอ (Submit Request)'}
        </button>
      </div>
    </form>
  );
};

export default WorkPermitForm;

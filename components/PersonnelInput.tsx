import React from 'react';
import type { Personnel } from '../types';
import { PersonType } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface PersonnelInputProps {
  person: Personnel;
  onChange: (id: string, updatedPerson: Personnel) => void;
  onRemove: (id: string) => void;
}

const InputField: React.FC<{ label: string; id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean }> = 
  ({ label, id, name, value, onChange, placeholder, required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-2">
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="block w-full rounded-md border-0 bg-white py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 transition"
      />
    </div>
  </div>
);


const PersonnelInput: React.FC<PersonnelInputProps> = ({ person, onChange, onRemove }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(person.id, { ...person, [name]: value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as PersonType;
    // Clear fields of the other type when switching
    const clearedPerson = {
        ...person,
        type: newType,
        employeeId: newType === PersonType.EXTERNAL ? '' : person.employeeId,
        fullName: newType === PersonType.INTERNAL ? '' : person.fullName,
        company: newType === PersonType.INTERNAL ? '' : person.company,
        nationalId: newType === PersonType.INTERNAL ? '' : person.nationalId,
    };
    onChange(person.id, clearedPerson);
  };

  return (
    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50 relative">
      <button
        type="button"
        onClick={() => onRemove(person.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition"
        aria-label="Remove person"
      >
        <TrashIcon />
      </button>

      <fieldset>
        <legend className="text-sm font-semibold leading-6 text-gray-900">ประเภทบุคคล (Personnel Type)</legend>
        <div className="mt-2 flex gap-x-6">
          <div className="flex items-center gap-x-2">
            <input
              id={`internal-${person.id}`}
              name={`type-${person.id}`}
              type="radio"
              value={PersonType.INTERNAL}
              checked={person.type === PersonType.INTERNAL}
              onChange={handleTypeChange}
              className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-600"
            />
            <label htmlFor={`internal-${person.id}`} className="block text-sm font-medium leading-6 text-gray-900">
              พนักงานภายใน
            </label>
          </div>
          <div className="flex items-center gap-x-2">
            <input
              id={`external-${person.id}`}
              name={`type-${person.id}`}
              type="radio"
              value={PersonType.EXTERNAL}
              checked={person.type === PersonType.EXTERNAL}
              onChange={handleTypeChange}
              className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-600"
            />
            <label htmlFor={`external-${person.id}`} className="block text-sm font-medium leading-6 text-gray-900">
              บุคคลภายนอก
            </label>
          </div>
        </div>
      </fieldset>

      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
        {person.type === PersonType.INTERNAL ? (
          <div className="sm:col-span-3">
            <InputField
              label="รหัสพนักงาน"
              id={`employeeId-${person.id}`}
              name="employeeId"
              value={person.employeeId}
              onChange={handleInputChange}
              placeholder="เช่น 123456"
              required
            />
          </div>
        ) : (
          <>
            <InputField
              label="ชื่อ-นามสกุล"
              id={`fullName-${person.id}`}
              name="fullName"
              value={person.fullName}
              onChange={handleInputChange}
              placeholder="เช่น สมชาย ใจดี"
              required
            />
            <InputField
              label="บริษัท"
              id={`company-${person.id}`}
              name="company"
              value={person.company}
              onChange={handleInputChange}
              placeholder="เช่น บริษัท เอบีซี จำกัด"
              required
            />
             <InputField
              label="เลขบัตรประชาชน/Passport"
              id={`nationalId-${person.id}`}
              name="nationalId"
              value={person.nationalId}
              onChange={handleInputChange}
              required
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PersonnelInput;
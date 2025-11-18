
export enum PersonType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export interface Personnel {
  id: string;
  type: PersonType;
  employeeId: string;
  fullName: string;
  company: string;
  nationalId: string;
}

export interface WorkPermitRequest {
  reason: string;
  entryDateTime: string;
  personnel: Personnel[];
  equipmentIn: string;
  equipmentOut: string;
}

export interface SubmittedWorkPermitData extends WorkPermitRequest {
  documentId: string;
  submissionTimestamp: Date;
}

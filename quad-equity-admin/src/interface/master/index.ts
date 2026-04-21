export interface PatientItemInterface {
  text: string;
  value: string;
}

export interface CounsellorItemInterface {
  text: string;
  value: string;
}

export interface MasterState {
  masterData: {
    patient: PatientItemInterface[];
    counsellor: CounsellorItemInterface[];
  };
}

export interface ApiResponse {
  data: {
    patient: PatientItemInterface[];
    counsellor: CounsellorItemInterface[];
  };
  message: string;
  status: boolean;
}

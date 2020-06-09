import { validators } from "@openmrs/esm-module-config";

export const programsConfigSchema = {
  programs: {
    arrayElements: {
      programUuid: { validators: [validators.isString] },
      programName: { validators: [validators.isString] },
      forms: {
        arrayElements: {
          encounterTypeUuid: { validators: [validators.isString] },
          formUuid: { validators: [validators.isString] },
          formName: { validators: [validators.isString] }
        }
      }
    },
    default: []
  }
};

export type ProgramFormsConfig = {
  programUuid: string;
  programName: string;
  forms: Array<FormSelector>;
};

export interface ProgramConfig {
  programs: ProgramFormsConfig[];
}

export type FormSelector = {
  encounterTypeUuid: string;
  formUuid?: string;
};

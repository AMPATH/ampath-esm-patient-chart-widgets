import { Form } from "../openmrs-resource/form.resource";
import { FormsFilter, areFormsEqual } from "./form-list-filter";
import { Encounter } from "../openmrs-resource/encounter.resource";
import { ProgramFormsConfig } from "../config/programs.schema";

export function groupFormsByProgram(
  forms: Array<Form>,
  programsConfig: Array<ProgramFormsConfig>,
  encounters: Array<Encounter> = []
): Array<ProgramForms> {
  let grouped: Array<ProgramForms> = programsConfig.map(config => {
    let formFilter = new FormsFilter(forms);
    let programForms: Array<Form> = [];
    config.forms.forEach(selector => {
      programForms = programForms.concat(
        formFilter.filterByFormAndEncounterType(
          selector.encounterTypeUuid,
          selector.formUuid || null
        ).forms
      );
    });
    let program: ProgramForms = {
      programUuid: config.programUuid,
      programName: config.programName,
      programForms: programForms
    };

    let availability = filterAvailableCompletedForms(programForms, encounters);
    program.availableForms = availability.available;
    program.completedForms = availability.completed;
    return program;
  });

  return grouped;
}

export function filterAvailableCompletedForms(
  forms: Array<Form>,
  encounters: Array<Encounter>
): {
  available: Array<Form>;
  completed: Array<Encounter>;
} {
  const availability = {
    available: [],
    completed: []
  };

  forms.forEach(form => {
    let completedEncounters = encounters.filter(encounter => {
      return areFormsEqual(encounter.form, form);
    });
    if (completedEncounters.length > 0) {
      availability.completed = availability.completed.concat(
        completedEncounters
      );
    } else {
      availability.available.push(form);
    }
  });
  return availability;
}

export type ProgramForms = {
  programName: string;
  programUuid: string;
  programForms: Array<Form>;
  availableForms?: Array<Form>;
  completedForms?: Array<Encounter>;
};

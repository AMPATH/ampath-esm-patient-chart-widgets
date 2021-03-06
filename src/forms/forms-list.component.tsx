import React from "react";
import { match } from "react-router";
import dayjs from "dayjs";
import styles from "../summary-card.css";
import { searchForms, Form } from "../openmrs-resource/form.resource";
import { FormsFilter } from "./form-list-filter";
import {
  getPatientEncounters,
  Encounter
} from "../openmrs-resource/encounter.resource";
import { getCurrentPatientUuid, newWorkspaceItem } from "@openmrs/esm-api";
import { filterAvailableCompletedForms } from "./form-grouper";
import Parcel from "single-spa-react/parcel";
import { Link } from "react-router-dom";
import { Subscription } from "rxjs";

export default function FormsList(props: FormsListProps) {
  // console.log("props", props);
  const baseChartUrl = `${props.match.url.substr(
    0,
    props.match.url.search("/hiv-dashboard")
  )}/hiv-dashboard`;
  let formFilter: FormsFilter;
  const [forms, setForms] = React.useState(new Array<Form>());
  const [encounters, setEncounters] = React.useState(new Array<Encounter>());
  const [completedForms, setCompletedForms] = React.useState(
    new Array<Encounter>()
  );
  const [allForms, setAllForms] = React.useState(new Array<Form>());
  const [searchTerm, setSearchTerm] = React.useState("");

  const formItemStyle = {
    paddingTop: "2px",
    paddingBottom: "2px",
    cursor: "pointer"
  };

  const handleFormSelected = (selectedForm, formName, encounter = null) => {
    newWorkspaceItem({
      component: p => {
        return (
          <Parcel
            config={System.import("@ampath/esm-angular-form-entry")}
            view="form"
            formUuid={selectedForm}
            key={selectedForm}
            encounterUuid={encounter}
            entryStarted={p.entryStarted}
            entrySubmitted={p.entrySubmitted}
            entryCancelled={p.entryCancelled}
            closeComponent={p.closeComponent}
            handleError={err => console.error(err)}
            wrapWith="div"
            mountParcel={p.singleSpaContext.mountParcel}
          ></Parcel>
        );
      },
      name: formName || "Form",
      props: {
        ...props.props,
        match: { params: {} }
      },
      componentClosed: () => {
        setAllForms([]);
      },
      inProgress: false,
      validations: (workspaceTabs: any[]) =>
        workspaceTabs.findIndex(
          tab => tab.props.formUuid !== null && tab.props.formUuid !== undefined
        )
    });
  };

  const handleFormSearchInput = searchTerm => {
    setSearchTerm(searchTerm);
  };

  const applyDefaultFilter = () => {
    let filter = new FormsFilter(allForms).filterUnpublishedRetired();
    let availability = filterAvailableCompletedForms(filter.forms, encounters);
    formFilter = new FormsFilter(availability.available);
    setCompletedForms(availability.completed);
  };

  React.useEffect(() => {
    let patientSub: Subscription;
    let encounterSub: Subscription;
    if (allForms.length === 0) {
      patientSub = getCurrentPatientUuid().subscribe(uuid => {
        encounterSub = getPatientEncounters(
          uuid,
          dayjs(new Date())
            .startOf("day")
            .toDate(),
          dayjs(new Date())
            .endOf("day")
            .toDate()
        ).subscribe(encounters => {
          searchForms("POC").subscribe(forms => {
            setEncounters(encounters);
            setAllForms(forms);
          });
        });
      });
    }
    return () => {
      patientSub ? patientSub.unsubscribe() : null;
      encounterSub ? encounterSub.unsubscribe() : null;
    };
  }, [allForms]);

  React.useEffect(() => {
    if (!formFilter) {
      applyDefaultFilter();
    }
    if (searchTerm && searchTerm.trim() !== "") {
      formFilter = formFilter.filterByText(searchTerm);
    }
    setForms(formFilter.forms);
  }, [searchTerm, allForms]);

  return (
    <div
      style={{
        minWidth: "20rem",
        textAlign: "left"
      }}
      className={`omrs-card ${styles.card}`}
    >
      <div className={styles.header}>
        <div className={`${styles.headerTitle}`}>
          <h2 className="omrs-padding-left-16">
            Forms List{" "}
            <input
              className={`omrs-type-body-regular`}
              placeholder="Search form"
              aria-label="Search form"
              onChange={$event => handleFormSearchInput($event.target.value)}
            />
          </h2>
        </div>
      </div>
      <div style={{ maxHeight: "320px", overflow: "scroll" }}>
        {completedForms &&
          completedForms.map(encounter => {
            return (
              <div
                key={encounter.form.uuid}
                tabIndex={-1}
                style={{
                  borderBottom: "0.5px solid lightgray",
                  ...formItemStyle
                }}
              >
                <button
                  className="omrs-btn omrs-text-action"
                  onClick={() =>
                    handleFormSelected(
                      encounter.form.uuid,
                      encounter.form.name,
                      encounter.uuid
                    )
                  }
                >
                  {" "}
                  {encounter.form.name}{" "}
                </button>
                {/* <svg className="omrs-icon omrs-type-body-regular" fill="var(--omrs-color-ink-low-contrast)">
                  <use xlinkHref="#omrs-icon-chevron-right"></use>
                </svg> */}
                <br />
                <span className="omrs-type-body-regular omrs-padding-left-24">
                  <Link
                    to={`${baseChartUrl}/encounter-viewer/${encounter.uuid}`}
                    className="omrs-link omrs-filled-neutral"
                  >
                    <span
                      style={{
                        color: "var(--omrs-color-ink-medium-contrast)",
                        fontFamily: "Work Sans"
                      }}
                    >
                      {" "}
                      Completed on{" "}
                      {encounter.encounterDateTime.toLocaleDateString()}
                    </span>
                  </Link>
                </span>
              </div>
            );
          })}
        {forms &&
          forms.map(form => {
            return (
              <div
                role="button"
                key={form.uuid}
                tabIndex={-1}
                style={{
                  borderBottom: "0.5px solid lightgray",
                  ...formItemStyle
                }}
                onClick={() => handleFormSelected(form.uuid, form.name)}
              >
                <button className="omrs-btn omrs-text-action">
                  {" "}
                  {form.name}{" "}
                </button>
                {/* <svg className="omrs-icon" style={{height: "2rem", width: "2rem"}} fill="var(--omrs-color-ink-low-contrast)">
                  <use xlinkHref="#omrs-icon-chevron-right"></use>
                </svg> */}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export type FormsListProps = {
  match?: match;
  location?: any;
  props: any;
  singleSpaContext?: any;
};

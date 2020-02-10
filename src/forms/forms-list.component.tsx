import React from "react";
import { match } from "react-router";
import styles from "../summary-card.css";
import { FormRenderer } from "./form-renderer.component";
import { searchForms, Form } from "./form.resource";
import { addComponentToWorkSpace } from "../work-space/work-space-controller";
import { FormsFilter } from "./form-list-filter";

export default function FormsList(props: FormsListProps) {
  const formItemStyle = {
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "10px",
    minHeight: "30px",
    cursor: "pointer"
  };

  const handleFormSelected = selectedForm => {
    addComponentToWorkSpace({
      component: FormRenderer,
      name: "Form",
      props: { ...props.props, formUuid: selectedForm, match: { params: {} } },
      inProgress: false
    }).then(
      success => {},
      error => {
        console.error(error);
      }
    );
  };

  const [forms, setForms] = React.useState(new Array<Form>());
  let allForms = [];
  let defaultFilter: FormsFilter;
  const applyDefaultFilter = () => {
    defaultFilter = new FormsFilter(allForms).filterUnpublishedRetired();
    setForms(defaultFilter.forms);
  };
  React.useEffect(() => {
    searchForms("POC").subscribe(forms => {
      allForms = forms;
      defaultFilter = new FormsFilter(allForms);
      applyDefaultFilter();
    });
  }, []);

  return (
    <div
      style={{ margin: "1.25rem, 1.5rem", minWidth: "20rem" }}
      className={`omrs-card ${styles.card}`}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>Forms List</div>
      </div>
      <div style={{ maxHeight: "320px", overflow: "scroll" }}>
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
                onClick={$event => handleFormSelected(form.uuid)}
              >
                {form.name}
              </div>
            );
          })}
      </div>
    </div>
  );
}

type FormsListProps = {
  match: match;
  location: any;
  props: any;
};

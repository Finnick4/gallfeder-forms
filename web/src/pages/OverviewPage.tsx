import EditableFormsOverview from "../components/overview/EditableFormsOverview.tsx";


export const OverviewPage = () => {
    // TODO check that the user is logged in

    return (
      <div className="page overview">
          <h1>Forms</h1>
          <EditableFormsOverview></EditableFormsOverview>
      </div>
    );
}

export default OverviewPage
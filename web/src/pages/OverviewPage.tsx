import EditableFormsOverview from "../components/overview/EditableFormsOverview.tsx";
import {useNavigate} from "react-router-dom";
import {isLoggedIn} from "../shared/checks.ts";
import {useEffect} from "react";


export const OverviewPage = () => {
    const nav = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) {
            nav("/login")
        }
    }, [nav]);

    return (
      <div className="page overview">
          <h1>Forms</h1>
          <EditableFormsOverview></EditableFormsOverview>
      </div>
    );
}

import {BrowserRouter, Route, Routes} from "react-router-dom";
import ResponsePage from "./pages/form/ResponsePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import OverviewPage from "./pages/OverviewPage.tsx";
import {FormModifyPages} from "./pages/form/FormModifyPages.tsx";
import {FormModifySubpages} from "./shared/types.ts";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<OverviewPage></OverviewPage>}></Route>
                <Route path="/login" element={<LoginPage></LoginPage>}></Route>
                <Route path="/form/:formID/respond" element={<ResponsePage></ResponsePage>}></Route>
                <Route path="/form/:formID/edit" element={<FormModifyPages subpage={FormModifySubpages.Edit}></FormModifyPages>}></Route>
                <Route path="/form/:formID/responses" element={<FormModifyPages subpage={FormModifySubpages.Responses}></FormModifyPages>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App

import {BrowserRouter, Route, Routes} from "react-router-dom";
import ResponsePage from "./pages/form/ResponsePage.tsx";
import EditFormPage from "./pages/form/EditFormPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import OverviewPage from "./pages/OverviewPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<OverviewPage></OverviewPage>}></Route>
                <Route path="/login" element={<LoginPage></LoginPage>}></Route>
                <Route path="/form/:formID/respond" element={<ResponsePage></ResponsePage>}></Route>
                <Route path="/form/:formID/edit" element={<EditFormPage></EditFormPage>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App

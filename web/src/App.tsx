import {BrowserRouter, Route, Routes} from "react-router-dom";
import ResponsePage from "./pages/response/ResponsePage.tsx";
import EditFormPage from "./pages/response/EditFormPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage></LoginPage>}></Route>
                <Route path="/form/:formID/respond" element={<ResponsePage></ResponsePage>}></Route>
                <Route path="/form/:formID/edit" element={<EditFormPage></EditFormPage>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App

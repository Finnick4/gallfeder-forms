import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ResponsePage from "./pages/response/ResponsePage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/form/:formID/respond" element={<ResponsePage></ResponsePage>}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App

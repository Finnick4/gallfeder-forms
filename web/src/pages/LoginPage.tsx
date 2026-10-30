import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {isLoggedIn} from "../shared/checks.ts";
import {GoogleMaterialSymbol} from "../components/GoogleMaterialSymbol.tsx";


export const LoginPage = () => {
    const [isTryingToLogIn, setState] = useState<boolean>(false);

    const handleRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nav = useNavigate();

    useEffect(() => {
        if (isLoggedIn()) {
            nav("/");
        }
    }, []);
    const tryLogIn = () => {
        if (isTryingToLogIn || handleRef.current == null || passwordRef.current == null) {
            return;
        }
        console.log("Trying to log in!");
        setState(true);

        fetch(`http://localhost:8080/api/sessions`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                "handle": handleRef.current.value,
                "password": passwordRef.current.value
            })
        })
            .then(r => {
                setState(false);
                if (r.status != 200) {
                    console.log("Failed to login: " + r.status);
                    return null;
                }
                console.log("logged in!");

                nav("/");
                return r.json();
            })
            .catch(e => {
                console.warn(e);
                setState(false);
            });

    }

    return (
        <div className="page login">
            <div className="section">
                <h1>Log in</h1>
                <label>
                    <h2>User Handle</h2>
                    <input
                        type="text"
                        className="handle usable"
                        disabled={isTryingToLogIn}
                        ref={handleRef}
                        onKeyUp={e => {
                            if (e.key == "Enter") {
                                tryLogIn();
                            }
                        }}
                    />
                </label>
                <label>
                    <h2>Password</h2>
                    <input
                        type="password"
                        className="password usable"
                        disabled={isTryingToLogIn}
                        ref={passwordRef}
                        onKeyUp={e => {
                            if (e.key == "Enter") {
                                tryLogIn();
                            }
                        }}
                    />
                </label>
                <div>
                    <button
                        className="primary"
                        disabled={isTryingToLogIn}
                        onClick={tryLogIn}
                    ><GoogleMaterialSymbol iconName={isTryingToLogIn ? "progress_activity" : "login"} /> Log in</button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage
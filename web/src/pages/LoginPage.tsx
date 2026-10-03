import {useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {isLoggedIn} from "../shared/checks.ts";


export const LoginPage = () => {
    const handleRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const nav = useNavigate();

    useEffect(() => {
        if (isLoggedIn()) {
            nav("/")
        }
    }, []);
    const tryLogIn = () => {
        if (handleRef.current == null || passwordRef.current == null || btnRef.current == null) {
            return
        }
        console.log("Trying to log in!");
        handleRef.current.classList.add("disabled");
        passwordRef.current.classList.add("disabled");
        btnRef.current.classList.add("disabled");

        fetch(`http://localhost:8080/api/sessions`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                "handle": handleRef.current.value,
                "password": passwordRef.current.value
            })
        })
            .then(r => {
                if (r.status != 200) {
                    console.log(r);
                    return null;
                }
                console.log("logged in!");
                if (handleRef.current != null && passwordRef.current != null && btnRef.current != null) {
                    handleRef.current.classList.remove("disabled");
                    passwordRef.current.classList.remove("disabled");
                    btnRef.current.classList.remove("disabled");
                }

                nav("/");
                return r.json();
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
                        ref={btnRef}
                        onClick={tryLogIn}
                    >Log in</button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage
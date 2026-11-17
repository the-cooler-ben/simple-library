import {useState} from "preact/hooks";

function LoginForm ({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [registering, setRegistering] = useState('');
    const [error, setError] = useState(false);
    const API_BASE = "http://localhost:3000/api"

    async function handleSubmit (e) {
        e.preventDefault();
        if (registering) {
            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
                setError((await res.json()).error);
                return;
            }
        }
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error);
            return;
        }
        onLogin(data);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input value={username} placeholder="Username"
                       onChange={(e) => setUsername(e.target.value)} />
                <input type="password" value={password} placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)} />
                <button>{registering ? "Sign up" : "Log in"}</button>
                <button type="button" onClick={() => setRegistering(!registering)}>
                    {registering ? "Have an account? Log in" : "New here? Sign up"}
                </button>
            </form>
        </>
    )
}

export default LoginForm;
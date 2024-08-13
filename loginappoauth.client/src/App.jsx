import React, { useState } from 'react';
import { notification, Button } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="auth-container">
            <h2>Log in</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email..."
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password..."
                    />
                </div>
                <Button type="dashed">Log in</Button>
            </form>
        </div>
    );
}

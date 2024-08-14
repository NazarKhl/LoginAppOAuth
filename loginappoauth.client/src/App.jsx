import React, { useState } from 'react';
import { notification, Button, Card, Form, Input, Spin } from 'antd';
import './App.css';

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');

    const handleSubmit = async (values) => {
        const endpoint = isLogin ? 'https://localhost:7092/login' : 'https://localhost:7092/register';
        const payload = {
            email: values.email,
            password: values.password,
        };

        setLoading(true);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();

                if (isLogin) {
                    if (data.Token) {
                        localStorage.setItem('authToken', data.Token);
                        notification.success({
                            message: 'Login successful!',
                            description: 'Your token has been stored in local storage.',
                        });
                        fetchUserName();
                    } else {
                        notification.success({
                            message: 'Login successful!',
                        });
                    }
                } else {
                    notification.success({
                        message: 'Registration successful!',
                        description: `Your token is: ${data.Token || 'Not available'}`,
                    });
                }
            } else {
                const errorData = await response.json();
                notification.error({
                    message: 'Error',
                    description: errorData.Message || 'Something went wrong',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Unable to connect to the server.',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchUserName = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            notification.error({
                message: 'Error',
                description: 'No token found in localStorage.',
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:5260/api/auth', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserName(data);
            } else {
                notification.error({
                    message: 'Error',
                    description: 'Failed to fetch user data.',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Unable to connect to the server.',
            });
        }
    };

    const handleCardFlip = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
    };

    return (
        <div className="auth-container">
            <div className={`card-container ${isLogin ? 'login' : 'register'}`}>
                <Card
                    title={isLogin ? "Log in" : "Register"}
                    extra={<a onClick={handleCardFlip}>{isLogin ? "Register" : "Log in"}</a>}
                    className="auth-card"
                >
                    {loading ? (
                        <div className="spinner-container">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: 'Please enter your email!' }]}
                            >
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email..."
                                />
                            </Form.Item>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: 'Please enter your password!' }]}
                            >
                                <Input.Password
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password..."
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button className="actionButton" type="primary" htmlType="submit" block>
                                    {isLogin ? "Log in" : "Register"}
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                    {userName && <div className="user-info">Welcome, {userName}!</div>}
                </Card>
            </div>
        </div>
    );
}

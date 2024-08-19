import React, { useState } from 'react';
import { notification, Button, Card, Form, Input, Spin, Modal, Select } from 'antd';
import './App.css';

const { Option } = Select;

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [manualToken, setManualToken] = useState('');
    const [userName, setUserName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [assignRoleEmail, setAssignRoleEmail] = useState('');
    const [role, setRole] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSubmit = async (values) => {
        const endpoint = 'https://localhost:7092/login';
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
                console.log('Server response data:', data);

                setManualToken(data.token);
                setShowTokenInput(true);
            } else {
                const errorData = await response.json();
                notification.error({
                    message: 'Login Failed',
                    description: errorData.Message,
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

    const fetchUserName = async (token) => {
        if (!token) {
            console.log('No token available.');
            return;
        }

        try {
            const response = await fetch('https://localhost:7092/api/roles/UserInfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Roles data:', data.roles);

                if (Array.isArray(data.roles)) {
                    const rolesText = data.roles.join(', ');
                    console.log('Roles:', rolesText);

                    if (data.roles.includes('Admin')) {
                        setIsAdmin(true);
                        notification.success({
                            message: 'Admin Access Granted!',
                            description: `Roles: ${rolesText}`,
                        });
                    } else {
                        setIsAdmin(false);
                        notification.info({
                            message: 'User Access Granted!',
                            description: `Roles: ${rolesText}`,
                        });
                    }
                    setUserName(data.userName);  // Zak³adam, ¿e `userName` jest czêœci¹ odpowiedzi
                    setIsLoggedIn(true);
                } else {
                    notification.error({
                        message: 'Error',
                        description: 'Roles data is not in the expected format.',
                    });
                }
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

    const handleAssignRole = async () => {
        setLoading(true);
        const token = manualToken;

        try {
            const response = await fetch('https://localhost:7092/api/Roles/AssignRole', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: assignRoleEmail, role: role }),
            });

            if (response.ok) {
                notification.success({
                    message: 'Role assigned successfully!',
                });
                setIsModalVisible(false);
            } else {
                const errorData = await response.json();
                notification.error({
                    message: 'Error',
                    description: errorData.Message,
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

    const handleLogout = () => {
        setIsLoggedIn(false);
        setManualToken('');
        setUserName('');
        setShowTokenInput(false);
        setIsAdmin(false);
        notification.info({
            message: 'Logged Out',
            description: 'You have been logged out successfully.',
        });
    };

    return (
        <div className="auth-container">
            {!isLoggedIn ? (
                !showTokenInput ? (
                    <div className={`card-container ${isLogin ? 'login' : 'register'}`}>
                        <Card
                            title="Log in"
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
                                            Log in
                                        </Button>
                                    </Form.Item>
                                </Form>
                            )}
                        </Card>
                    </div>
                ) : (
                    <div className="token-input-container">
                        <Card title="Confirm Token" className="token-input-card">
                            <Form layout="vertical" onFinish={() => fetchUserName(manualToken)}>
                                <Form.Item
                                    label="Token"
                                    rules={[{ required: true, message: 'Please enter the token!' }]}
                                >
                                    <Input
                                        value={manualToken}
                                        onChange={(e) => setManualToken(e.target.value)}
                                        placeholder="Enter token..."
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button className="actionButton" type="primary" htmlType="submit" block>
                                        Confirm Data
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>
                )
            ) : (
                    <div className="user-info">
                        <p> <strong>Hi</strong> <strong>{isAdmin ? 'Admin' : 'Worker'}</strong> {userName}!</p>
                    <Button onClick={handleLogout} type="default" block>
                        Log Out
                    </Button>
                    {isAdmin && (
                        <Button
                            type="primary"
                            onClick={() => setIsModalVisible(true)}
                            block
                            style={{ marginTop: 16 }}
                        >
                            Assign Roles
                        </Button>
                    )}
                </div>
            )}

            {isAdmin && (
                <Modal
                    title="Assign Role"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form layout="vertical" onFinish={handleAssignRole}>
                        <Form.Item
                            label="User Email"
                            rules={[{ required: true, message: 'Please enter the user email!' }]}
                        >
                            <Input
                                type="email"
                                value={assignRoleEmail}
                                onChange={(e) => setAssignRoleEmail(e.target.value)}
                                placeholder="Enter user email..."
                            />
                        </Form.Item>
                        <Form.Item
                            label="Role"
                            rules={[{ required: true, message: 'Please select a role!' }]}
                        >
                            <Select
                                value={role}
                                onChange={(value) => setRole(value)}
                                placeholder="Select a role..."
                            >
                                <Option value="Worker">Worker</Option>
                                <Option value="Admin">Admin</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Assign Role
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </div>
    );
}

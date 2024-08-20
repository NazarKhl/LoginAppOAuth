import React, { useState, useEffect } from 'react';
import { notification, Button, Card, Form, Input, Spin, Modal, Select } from 'antd';
import './App.css';

const { Option } = Select;

export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [userName, setUserName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [assignRoleEmail, setAssignRoleEmail] = useState('');
    const [role, setRole] = useState('');
    const [removeRoleEmail, setRemoveRoleEmail] = useState('');
    const [removeRole, setRemoveRole] = useState('');
    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchUserName(token);
        }
    }, []);

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
                const accessToken = data.accessToken;
                console.log('Access Token:', accessToken);

                localStorage.setItem('accessToken', accessToken);

                fetchUserName(accessToken);

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
            const response = await fetch('https://localhost:7092/api/Roles/UserInfo', {
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
                    setUserName(data.userName);
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
        const token = localStorage.getItem('accessToken');

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
                    message: 'User role is already exist',
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

    const handleRemoveRole = async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch('https://localhost:7092/api/Roles/RemoveRole', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: removeRoleEmail, role: removeRole }),
            });

            if (response.ok) {
                notification.success({
                    message: 'Role removed successfully!',
                });
                setIsRemoveModalVisible(false);
            } else {
                const errorData = await response.json();
                notification.error({
                    message: 'User role is already deleted',
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
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setUserName('');
        setIsAdmin(false);
        notification.info({
            message: 'Logged Out',
            description: 'You have been logged out successfully.',
        });
    };

    return (
        <div className="auth-container">
            {!isLoggedIn ? (
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
                <div className="user-info">
                    <p> <strong>Hi</strong> {isAdmin ? 'Admin' : 'Worker'} <strong>{userName}</strong></p>
                    <Button onClick={handleLogout} type="default" block>
                        Log Out
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                type="primary"
                                onClick={() => setIsModalVisible(true)}
                                block
                                style={{ marginTop: 16 }}
                            >
                                Assign Roles
                            </Button>
                            <Button
                                type="primary"
                                danger
                                onClick={() => setIsRemoveModalVisible(true)}
                                block
                                style={{ marginTop: 16, border: 0 }}
                            >
                                Remove Roles
                            </Button>
                        </>
                    )}
                </div>
            )}

            {isAdmin && (
                <>
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
                                <Button type="dashed" htmlType="submit" block>
                                    Assign Role
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Modal
                        title="Remove Role"
                        visible={isRemoveModalVisible}
                        onCancel={() => setIsRemoveModalVisible(false)}
                        footer={null}
                    >
                        <Form layout="vertical" onFinish={handleRemoveRole}>
                            <Form.Item
                                label="User Email"
                                rules={[{ required: true, message: 'Please enter the user email!' }]}
                            >
                                <Input
                                    type="email"
                                    value={removeRoleEmail}
                                    onChange={(e) => setRemoveRoleEmail(e.target.value)}
                                    placeholder="Enter user email..."
                                />
                            </Form.Item>
                            <Form.Item
                                label="Role"
                                rules={[{ required: true, message: 'Please select a role!' }]}
                            >
                                <Select
                                    value={removeRole}
                                    onChange={(value) => setRemoveRole(value)}
                                    placeholder="Select a role..."
                                >
                                    <Option value="Worker">Worker</Option>
                                    <Option value="Admin">Admin</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button type="dashed" danger htmlType="submit" block>
                                    Remove Role
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </>
            )}
        </div>
    );
}

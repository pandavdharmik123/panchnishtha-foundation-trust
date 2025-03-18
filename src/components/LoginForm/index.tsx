"use client";

import React from 'react';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import '@/styles/login.scss';
import {Button, Form, Input, notification} from "antd";
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { loginUser, UserResponse } from '@/redux/slices/userSlice';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [api, contextHolder] = notification.useNotification();

  const handleLogin = async (values: {email: string, password: string}) => {
    try {
      let { email } = values;
      const {password} = values;
      if(email.includes('@pannishthafoundation.com')) {
        email = email.replace('@pannishthafoundation.com', '');
      } else {
        email = email + '@pannishthafoundation.com';
      };
  
      const result: UserResponse = await dispatch(loginUser({ email, password })).unwrap();
      if(result.success === true && result.token) {
        await api.success({
          message: '',
          description: 'Login Successfully!',
        });
        localStorage.setItem("userId", result.userId)
        localStorage.setItem("userEmail", result.userEmail)
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (error: unknown) { // ✅ Fixed: Removed `any`, using `unknown`
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      api.error({
        message: '',
        description: errorMessage, // ✅ Fixed: Proper error handling
      });
    }
  }
 
  return (
    <div className='login-form'>
      {contextHolder}
      <div className='company-logo'>
        {/* <Image src={companyLogo} alt="Logo" /> */}
      </div>
      <Form
        name="wrap"
        labelAlign="left"
        labelWrap
        colon={false}
        style={{ maxWidth: 600 }}
        onFinish={handleLogin}
      >
        <div className='input-wrapper'>
          <label className='label-text'>Email</label>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Email is required' }]}
          >
            {/* <Input placeholder="Email" /> */}
            <Input placeholder="Email" addonAfter="@punchnishthafoundation.com" />
          </Form.Item>
        </div>

        <div className='input-wrapper'>
          <label className='label-text'>Password</label>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              placeholder="Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit" className='login-button'>
          Log In
        </Button>
      </Form>
    </div>
  );
};

export default LoginForm;

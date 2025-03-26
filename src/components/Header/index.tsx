'use client';

import React from 'react';
import { Tooltip } from 'antd';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logoutUser } from '@/redux/slices/userSlice';
import { useRouter } from 'next/navigation';
import '@/styles/header.scss'
import { LogoutOutlined } from '@ant-design/icons';

const HeaderComponent: React.FC = () => {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  

  return (
    <>
      <span className='trust-header'>પંચનિષ્ઠા ફાઉન્ડેશન ટ્રસ્ટ</span>
       {/*<span className='trust-header'>RUGGED MONITORING (RMES)</span>*/}
      
      <Tooltip title='Log Out' placement="top">
        <LogoutOutlined onClick={handleLogout} className='logout-icon'/>
      </Tooltip>
    </>
  );
};

export default HeaderComponent;
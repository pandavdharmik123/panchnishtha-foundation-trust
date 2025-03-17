'use client';

import React from 'react';
import { Layout } from 'antd';
import HeaderComponent from '@/components/Header';
import SiderComponent from '@/components/SiderComponent';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      <Sider width={200} className='sider'>
        <SiderComponent />
      </Sider>

      <Layout className='layout'>
        <Header className='header'>
          <HeaderComponent />
        </Header>

        <Content className='content'>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

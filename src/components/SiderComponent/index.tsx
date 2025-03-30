'use client';

import React from 'react';
import {
  BarChartOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';

const items = [
  { key: '/', icon: <UserOutlined />, label: 'Dashboard' },
  { key: '/tokens', icon: <BarChartOutlined />, label: 'Tokens' },
  { key: '/expenses', icon: <DollarOutlined />, label: 'Expenses' },
  // { key: '/users', icon: <TeamOutlined />, label: 'Users' },
];

const SiderComponent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <div className="trust-logo" />
      <Menu
        className='sider-menu'
        mode="inline"
        selectedKeys={[pathname]}
        onClick={(e) => router.push(e.key)}
        items={items}
      />
    </>
  );
};

export default SiderComponent;

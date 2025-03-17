'use client';

import React, { useEffect, useState } from 'react';
import '@/styles/homePage.scss'
import { isEmpty, startCase } from 'lodash';
import EChartsComponent from '@/components/TokensChart';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTokens } from '@/redux/slices/tokens';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

export interface GroupDataInterface { 
  [key: string]: { tokenCount: number; totalAmount: number } 
}

const App: React.FC = () => {
  const [groupedData, setGroupedData] = useState({});

  const userName = localStorage?.getItem('userEmail')?.split('@')?.[0] || 'Admin';

  const dispatch: AppDispatch = useDispatch();
  const { tokens } = useSelector((state: RootState) => state.tokens);

  useEffect(() => {
    dispatch(getAllTokens());
  }, []);

  useEffect(() => {
    if(!isEmpty(tokens)) {
      const groupedData: GroupDataInterface = {};
      tokens.forEach((entry) => {
        const dateObj = new Date(entry.createdAt as Date);
        const dateKey = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
  
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { tokenCount: 0, totalAmount: 0 };
        }
  
        groupedData[dateKey].tokenCount += 1; // Count tokens
        groupedData[dateKey].totalAmount += Number(entry.amount); // Sum amounts
      });
      setGroupedData(groupedData);
    }
  }, [tokens]);

  const getTotalCountAmount = (data: GroupDataInterface) => {
    const totalAmount = Object.keys(data).reduce((acc, curr) => acc + data[curr]?.totalAmount, 0) || 0;
    const totalCounts = Object.keys(data).reduce((acc, curr) => acc + data[curr]?.tokenCount, 0) || 0;

    return { totalAmount, totalCounts }
  }

  return (
    <div className='home-container'>
      <h2 className='welcome-msg'>Welcome {startCase(userName)}!</h2>
      <div className='chart-card-container'>
        <div className='chart-card'>
          <div className='chart-header'>
            <div className='title-container'>
              <span>Token Statastics</span>
            </div>
            <div className='title-container'>
              <span className='total-text'>Total Tokens: {getTotalCountAmount(groupedData)?.totalCounts}</span>
              <span className='total-text'>Total Amount: ₹{getTotalCountAmount(groupedData)?.totalAmount}</span>
            </div>
          </div>
          <EChartsComponent groupedData={groupedData}/>
        </div>
        <div className='chart-card'></div>
      </div>
    </div>
  );
};

export default App;
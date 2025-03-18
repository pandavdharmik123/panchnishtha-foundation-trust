'use client';

import React, { useEffect, useRef } from 'react';
import * as echart from 'echarts';
import { GroupDataInterface } from '@/app/page';

const EChartsComponent = ({ groupedData }: { groupedData: GroupDataInterface }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = echart.init(chartRef.current);

    const dates = Object.keys(groupedData).sort(); // Sort dates
    const values = dates.map((date) => ({
      value: groupedData[date].tokenCount, // Use Token Count for bar height
      tooltipData: groupedData[date], // Store both Token Count & Amount for tooltip
    }));

    const tokenCounts = Object.keys(groupedData).map(key => groupedData[key]?.tokenCount);

    const options = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: { color: '#ffffff', fontSize: 14 },
        borderRadius: 8,
        padding: 10,
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: echarts.EChartTooltipFormatterCallbackParams[]) => {
          if (!params.length || !params[0].data) return '';

          const data = (params[0].data as { tooltipData: { tokenCount: number; totalAmount: number } }).tooltipData;

          return `
            <div style="font-size: 14px; line-height: 1.5;">
              <span style="color: #FFD700; font-weight: bold;">📅 Date:</span> <span style="font-weight: bold;">${params[0].name}</span><br/>
              <span style="color: #4CAF50; font-weight: bold;">🔢 Token Count:</span> <span style="font-weight: bold; font-size: 16px;">${data.tokenCount}</span><br/>
              <span style="color: #FF5733; font-weight: bold;">💰 Total Amount:</span> <span style="font-weight: bold; font-size: 16px;">₹${data.totalAmount}</span>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { rotate: tokenCounts.length > 10 ? 30 : 0, fontWeight: 'bold' },
        name: 'Date',
        nameLocation: 'center',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      yAxis: {
        type: 'value',
        name: 'Token Count',
        nameLocation: 'center',
        nameGap: 40,
        nameTextStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        axisLabel: { fontWeight: 'bold' },
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' }, // ✅ Make Y-axis a dotted line
        },
      },
      series: [
        {
          name: 'Token Count',
          type: 'bar',
          data: values,
          barWidth: 30,
          borderRadius: 5,
          itemStyle: { color: '#4a954b', borderRadius: [5, 5, 0, 0] },
        },
      ],
    };

    // Render chart
    chartInstance.setOption(options);

    // Cleanup on unmount
    return () => {
      chartInstance.dispose();
    };
  }, [groupedData]);

  return <div ref={chartRef} style={{ width: '100%', height: '350px' }} />;
};

export default EChartsComponent;

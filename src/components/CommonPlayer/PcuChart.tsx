import { message } from 'antd';
import { useState } from 'react';
import { use } from 'echarts';
import ReactEcharts from 'echarts-for-react';
import { backgroundClip } from 'html2canvas/dist/types/css/property-descriptors/background-clip';
import { boxShadow } from 'html2canvas/dist/types/css/property-descriptors/box-shadow';
import { padEnd } from 'lodash';
import moment from 'moment';
import { useEffect, useRef } from 'react';

const PcuChart = ({ danmu = [], pcu = [], liveState = [], isFullScreen }) => {
  const echartsRef = useRef<any>(null);

  const option = {
    animation: false,
    color: ['rgba(179, 101, 199, 1)', 'rgba(36, 233, 141, 1)'],
    grid: {
      containLabel: false,
      left: '10px',
      top: 0,
      right: '10px',
      bottom: 0,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      boxShadow: 'none',
      shadowColor: 'none',

      padding: 0,
      axisPointer: {
        snap: true,
      },
      formatter: (params: any) => {
        let tooltipContent = '';
        const time = params[0].axisValueLabel;
        tooltipContent += `
   <div style="background-color: white; padding: 5px; border: 1px solid #ccc; margin-bottom: 5px; box-shadow: none;">
     <strong> 实时数据</strong>
      <div style="display: flex; align-items: center;">
      ${time}<br/>
      </div>
      <div style="display: flex; align-items: center; ">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: ${
          params[1]?.color
        }; border-radius: 50%; margin-right: 5px;"></span>
        <strong>${params[1]?.seriesName}</strong>
        ${params[1]?.value} 条/秒
      </div>
      <div style="display: flex; align-items: center; margin-top: 5px;">
      ${time}<br/>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: ${
          params[0]?.color
        }; border-radius: 50%; margin-right: 5px;"></span>
        <strong>${params[0]?.seriesName}</strong>
        ${params[0]?.value} 人/秒
      </div>
    </div>
   <div style="background-color: white; padding: 5px; border: 1px solid #ccc; margin-bottom: 5px; box-shadow: none;">
     <strong> ${liveState?.extra?.sumTitle || '汇总数据'}</strong>
    <div>
       ${liveState?.stats
         ?.map(
           (stat) => `
        <div style="display: flex; align-items: center;">
          ${stat?.statName}: ${stat?.statValue}
        </div>
      `,
         )
         .join('')}
    </div>
      </div>
`;

        return tooltipContent;
      },
    },
    xAxis: [
      {
        type: 'category',
        data: pcu.map((item: any) => moment(item.xVal * 1000).format('YYYY-MM-DD HH:mm:ss')),
        boundaryGap: false,
        axisTick: {
          alignWithLabel: true,
        },
        show: false,
      },
      {
        type: 'category',
        data: danmu.map((item: any) => moment(item.xVal * 1000).format('YYYY-MM-DD HH:mm:ss')),
        boundaryGap: false,
        axisTick: {
          alignWithLabel: true,
        },
        show: false,
      },
    ],
    yAxis: [
      {
        type: 'value',
        show: false,
      },
      {
        type: 'value',
        show: false,
      },
    ],
    series: [
      {
        data: pcu.map((item: any) => item.yVal),
        name: 'PCU(人/秒)',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(179, 101, 199, 1)',
        },
        areaStyle: {
          color: 'rgba(179, 101, 199, 0.65)',
        },
      },
      {
        data: danmu.map((item: any) => item.yVal),
        name: '弹幕数(条/秒)',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: 'rgba(36, 233, 141, 1)',
        },
        areaStyle: {
          color: 'rgba(36, 233, 141, 0.726)',
        },
        yAxisIndex: 1,
        xAxisIndex: 1,
      },
    ],
  };

  return (
    <ReactEcharts
      option={option}
      style={{
        position: 'absolute',
        left: 0,
        bottom: isFullScreen ? '60px' : '10%',
        width: '100%',
        height: '10%',
        zIndex: 999,
      }}
      ref={echartsRef}
    />
  );
};

export default PcuChart;

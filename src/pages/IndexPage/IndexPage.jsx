import React from 'react';
import EChartsComponent from './EChartsComponent';

const stackedBarOptions = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {            
            type: 'shadow'        
        }
    },
    legend: {
        data: ['Resueltos', 'No Resueltos', 'Total']
    },
    xAxis: {
        type: 'category',
        data: ['Problemas']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: 'Resueltos',
            type: 'bar',
            stack: 'total',
            data: [320]
        },
        {
            name: 'No Resueltos',
            type: 'bar',
            stack: 'total',
            data: [120]
        },
        {
            name: 'Total',
            type: 'bar',
            data: [440],
            emphasis: {
                focus: 'series'
            }
        }
    ]
};

const lineChartOptions = {
    xAxis: {
        type: 'category',
        data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: [120, 200, 150, 80, 70, 110, 130, 90, 150, 130, 120, 130, 140, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260],
        type: 'line'
    }]
};

const pieChartOptions = {
    title: {
      text: 'Distribución de Lenguajes de Programación',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Lenguajes',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: 'JavaScript' },
          { value: 735, name: 'Python' },
          { value: 580, name: 'Java' },
          { value: 484, name: 'C++' },
          { value: 300, name: 'Otros' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  /*
          <EChartsComponent options={lineChartOptions} />
        <EChartsComponent options={stackedBarOptions} />
        <EChartsComponent options={pieChartOptions} />
        */
const IndexPage = () => (
    <div>

    </div>
);

export default IndexPage;

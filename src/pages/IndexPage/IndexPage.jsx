import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import EChartsComponent from './EChartsComponent';
import LanguageCharts from './LanguageCharts';

const IndexPage = () => {
  const [lineChartOptions, setLineChartOptions] = useState({
    title: {
      text: 'Total de Envíos por Mes y Año',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Total Envíos'],
      left: 'left'
    },
    xAxis: {
      type: 'category',
      data: [],
      name: 'Mes/Año',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: 'Número de Envíos',
      nameLocation: 'middle',
      nameGap: 50
    },
    series: [{
      name: 'Total Envíos',
      data: [],
      type: 'line',
      smooth: true,
      markPoint: {
        data: [
          { type: 'max', name: 'Máximo' },
          { type: 'min', name: 'Mínimo' }
        ]
      },
      markLine: {
        data: [
          { type: 'average', name: 'Promedio' }
        ]
      }
    }]
  });

  useEffect(() => {

    apiService.get("Statics/GetLast365DaysSubmissionsByMonth").then(data => {
      const months = data.map(item => `${item.Month}/${item.Year}`);
      const submissions = data.map(item => item.TotalSubmissions);

      setLineChartOptions(prevOptions => ({
        ...prevOptions,
        xAxis: {
          ...prevOptions.xAxis,
          data: months
        },
        series: [{
          ...prevOptions.series[0],
          data: submissions
        }]
      }));
    })
  }, []);

  return (
    <div>
      <EChartsComponent options={lineChartOptions} />
      <LanguageCharts />
    </div>
  );
};

export default IndexPage;

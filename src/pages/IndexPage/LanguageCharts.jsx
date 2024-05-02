import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import EChartsComponent from './EChartsComponent';

const LanguageCharts = () => {
  const [barChartOptions, setBarChartOptions] = useState({});

  useEffect(() => {
    apiService.get("Statics/GetSubmissionsByLanguageAsync").then(data => {
      const languageMap = {
        3: 'Java',
        16: 'C++',
        19: 'Python'
      };
      const languageData = JSON.parse(data).map(item => ({
        ...item,
        Language: languageMap[item.Language] || 'Other'
      }));

      setBarChartOptions({
        title: {
          text: 'Envíos por Lenguaje de Programación',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            let displayText = `${params[0].name}<br/>`;
            params.forEach(param => {
              const value = param.value.toLocaleString();
              displayText += `${param.seriesName}: ${value}<br/>`;
            });
            return displayText;
          }
        },
        xAxis: {
          type: 'category',
          data: languageData.map(item => item.Language),
          name: 'Lenguaje de Programación'
        },
        yAxis: {
          type: 'value',
          name: 'Número de Envíos'
        },
        series: [{
          name: 'Envíos',
          data: languageData.map(item => ({
            value: item.TotalSubmissions,
            name: item.Language
          })),
          type: 'bar',
          label: {
            show: true,
            position: 'top',
            formatter: function (params) {
              return params.value.toLocaleString();
            }
          }
        }]
      });
    });
  }, []);

  return (
    <div>
      <EChartsComponent options={barChartOptions} />
    </div>
  );
};

export default LanguageCharts;

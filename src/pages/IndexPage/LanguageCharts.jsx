import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import EChartsComponent from './EChartsComponent';

const LanguageCharts = () => {
  const [barChartOptions, setBarChartOptions] = useState({});

  useEffect(() => {
    apiService.get("Statics/GetSubmissionsByLanguageAsync").then(data => {
      const languageData = JSON.parse(data);
      console.log(languageData);
      setBarChartOptions({
        title: {
          text: 'Envíos por Lenguaje de Programación',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
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
          data: languageData.map(item => item.TotalSubmissions),
          type: 'bar'
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

import React from 'react';
import EChartsReact from 'echarts-for-react';

const EChartsComponent = ({ options }) => {
  return (
    <EChartsReact
      style={{ height: '400px', width: '100%' }}
      option={options}
      notMerge={true}
      lazyUpdate={true}
      theme={"theme_name"}
    />
  );
};

export default EChartsComponent;

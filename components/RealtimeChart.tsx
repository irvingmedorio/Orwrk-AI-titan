
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealtimeChartProps {
  dataPoint: number;
  title: string;
  strokeColor: string;
  yAxisLabel: string;
  dataKey: string;
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({ dataPoint, title, strokeColor, yAxisLabel, dataKey }) => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    setData(prevData => {
      const newData = [...prevData, { name: new Date().toLocaleTimeString(), value: dataPoint }];
      return newData.length > 20 ? newData.slice(1) : newData; // Keep last 20 data points
    });
  }, [dataPoint]);
  
  // recharts expects the data key to be a string literal, not a variable.
  // This is a common workaround.
  const chartData = data.map(d => ({ [dataKey]: d.value, name: d.name }));

  return (
    <div className="h-64 w-full">
      <h4 className="text-md font-semibold text-dark-foreground mb-2">{title}</h4>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 10 }} />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.5)' }} stroke="rgba(255, 255, 255, 0.5)" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333' }}/>
          <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealtimeChart;

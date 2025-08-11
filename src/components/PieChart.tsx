import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface PieChartProps {
  widthAndHeight: number;
  series: number[];
  sliceColor: string[];
  strokeWidth?: number;
  strokeColor?: string;
}

interface PieSlice {
  value: number;
  color: string;
  startAngle: number;
  endAngle: number;
  percentage: number;
}

const PieChart: React.FC<PieChartProps> = ({
                                             widthAndHeight,
                                             series,
                                             sliceColor,
                                             strokeWidth = 2,
                                             strokeColor = '#ffffff'
                                           }) => {
  // Calculate total and percentages
  const total = series.reduce((sum, value) => sum + value, 0);

  if (total === 0 || series.length === 0) {
    return (
      <View
        style={{
          width: widthAndHeight,
          height: widthAndHeight,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Svg width={widthAndHeight} height={widthAndHeight}>
          <Circle
            cx={widthAndHeight / 2}
            cy={widthAndHeight / 2}
            r={(widthAndHeight / 2) - strokeWidth}
            fill="#e0e0e0"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Svg>
      </View>
    );
  }

  // Calculate pie slices
  const slices: PieSlice[] = [];
  let currentAngle = -90; // Start from top (-90 degrees)

  series.forEach((value, index) => {
    const percentage = (value / total) * 100;
    const angleSize = (value / total) * 360;

    slices.push({
      value,
      color: sliceColor[index] || '#cccccc',
      startAngle: currentAngle,
      endAngle: currentAngle + angleSize,
      percentage
    });

    currentAngle += angleSize;
  });

  // Convert degrees to radians
  const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Calculate path coordinates
  const createPath = (slice: PieSlice) => {
    const centerX = widthAndHeight / 2;
    const centerY = widthAndHeight / 2;
    const radius = (widthAndHeight / 2) - strokeWidth;

    const startAngleRad = degreesToRadians(slice.startAngle);
    const endAngleRad = degreesToRadians(slice.endAngle);

    const startX = centerX + radius * Math.cos(startAngleRad);
    const startY = centerY + radius * Math.sin(startAngleRad);
    const endX = centerX + radius * Math.cos(endAngleRad);
    const endY = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

    // Handle full circle case
    if (slice.endAngle - slice.startAngle >= 360) {
      return `M ${centerX} ${centerY - radius} 
              A ${radius} ${radius} 0 1 1 ${centerX - 0.001} ${centerY - radius} 
              Z`;
    }

    return `M ${centerX} ${centerY} 
            L ${startX} ${startY} 
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} 
            Z`;
  };

  return (
    <View style={{ width: widthAndHeight, height: widthAndHeight }}>
      <Svg width={widthAndHeight} height={widthAndHeight}>
        {slices.map((slice, index) => (
          <Path
            key={index}
            d={createPath(slice)}
            fill={slice.color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        ))}
      </Svg>
    </View>
  );
};

export default PieChart;

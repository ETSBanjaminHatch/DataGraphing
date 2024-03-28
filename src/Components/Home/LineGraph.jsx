import Plot from "react-plotly.js";
import React from "react";

export default function LineGraph({
  pol,
  formattedData,
  selectedDatasetIndex,
  frequencies,
  zeroAngleValue,
  zeroAngle,
}) {
  const graphedAngle = zeroAngle === "theta" ? "phi" : "theta";

  const processData = () => {
    const traces = [];
    console.log("zeroANLGE", zeroAngle);

    frequencies.forEach((frequency) => {
      const dataByFrequency =
        formattedData[selectedDatasetIndex][pol][frequency];

      const dataByGraphedAngle = dataByFrequency
        .filter((item) => item[zeroAngle] === zeroAngleValue)
        .reduce((acc, item) => {
          const angleValue = item[graphedAngle];
          if (!acc[angleValue]) {
            acc[angleValue] = [];
          }
          acc[angleValue].push({
            frequency: parseInt(frequency, 10),
            power: item.power,
          });
          return acc;
        }, {});

      Object.keys(dataByGraphedAngle).forEach((angleValue) => {
        const angle = parseFloat(angleValue);
        let trace = traces.find((t) => t.angle === angle);
        if (!trace) {
          trace = {
            x: [],
            y: [],
            type: "scatter",
            mode: "lines+markers",
            name: `${graphedAngle} ${angle}°`,
            angle: angle,
          };
          traces.push(trace);
        }
        dataByGraphedAngle[angleValue].forEach((item) => {
          trace.x.push(item.frequency);
          trace.y.push(item.power);
        });
      });
    });

    traces.sort((a, b) => a.angle - b.angle);

    return traces;
  };

  const data = processData();

  return (
    <Plot
      data={data}
      layout={{ width: 720, height: 440, title: `${pol} Polarization` }}
    />
  );
}

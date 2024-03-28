import Plot from "react-plotly.js";

export default function PolarLineGraph({
  selectedData,
  zeroAngle,
  pol,
  zeroAngleValue,
  formattedData,
}) {
  console.log("formattedData IN POLAR ", formattedData);
  const freqKeys = Object.keys(formattedData);
  console.log("FREQ KEYS : ", freqKeys);
  const mappedAngle = zeroAngle === "phi" ? "theta" : "phi";
  const angleLabel = zeroAngle === "phi" ? "Theta" : "Phi";
  const filteredData = selectedData.filter(
    (d) => d[zeroAngle] === zeroAngleValue
  );
  console.log("POL", pol);
  console.log("filteredData IN POLAR", filteredData);
  const theta = filteredData.map((d) => d[mappedAngle]);
  const r = filteredData.map((d) => d.power);
  const allR = selectedData.map((d) => d.power);
  const maxR = Math.max(...r);
  const minR = Math.min(...r);
  console.log("minR: ,", minR);
  console.log("MaxR ", maxR);
  const data = [
    {
      type: "scatterpolar",
      mode: "lines",
      r,
      theta,
      fill: "none",
      line: {
        color: "blue",
      },
    },
  ];
  // const dataSeries = Object.entries(formattedData).map(([frequency, data]) => {
  //   const filteredData = data.filter((d) => d[zeroAngle] === zeroAngleValue);
  //   const theta = filteredData.map((d) => d[mappedAngle]);
  //   const r = filteredData.map((d) => d.power);

  //   return {
  //     type: "scatterpolar",
  //     mode: "lines",
  //     r,
  //     theta,
  //     name: `Frequency ${frequency} MHz`,
  //     fill: "none",
  //   };
  // });

  //
  // const maxR = Math.max(
  //   ...Object.values(formattedData)
  //     .flat()
  //     .map((d) => d.power)
  // );

  return (
    <Plot
      data={data}
      layout={{
        width: 650,
        height: 550,
        polar: {
          radialaxis: {
            visible: true,
            range: [minR, maxR],
          },
          angularaxis: {
            tickmode: "array",
            tickvals: Array.from({ length: 12 }, (_, i) => i * 30),
            ticktext: Array.from({ length: 12 }, (_, i) => `${i * 30}°`),
            rotation: 90,
            direction: "clockwise",
          },
        },
        annotations: [
          {
            xref: "paper",
            yref: "paper",
            x: 0.5,
            xanchor: "center",
            y: -0.2,
            yanchor: "top",
            text: `${angleLabel} Angle (°)`,
            showarrow: false,
            font: {
              size: 20,
            },
          },
          {
            xref: "paper",
            yref: "paper",
            x: 0.5,
            xanchor: "center",
            y: 1.1,
            yanchor: "bottom",
            text: `Polarization: ${pol}`,
            showarrow: false,
            font: {
              size: 32,
            },
          },
        ],
        showlegend: false,
        margin: {
          b: 100,
        },
      }}
    />
  );
}

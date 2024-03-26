import Plot from "react-plotly.js";

export default function PolarLineGraph({ selectedData, zeroAngle }) {
  const mappedAngle = zeroAngle === "phi" ? "theta" : "phi";
  const angleLabel = zeroAngle === "phi" ? "Theta" : "Phi";
  const filteredData = selectedData.filter((d) => d[zeroAngle] === 0);
  const theta = filteredData.map((d) => d[mappedAngle]);
  const r = filteredData.map((d) => d.power);

  return (
    <Plot
      data={[
        {
          type: "scatterpolar",
          mode: "lines",
          r: r,
          theta: theta,
          fill: "none",
          line: {
            color: "blue",
          },
        },
      ]}
      layout={{
        width: 650,
        height: 550,
        polar: {
          radialaxis: {
            visible: true,
            range: [0, Math.max(...r) + Math.max(...r) * 0.2],
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
              size: 16,
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

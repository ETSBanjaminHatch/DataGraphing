import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3PolarLineGraph({ selectedData }) {
  const ref = useRef();

  useEffect(() => {
    // Clear previous SVG content
    d3.select(ref.current).selectAll("*").remove();
    const thetaValue = 0;
    // Filter data for the specified theta value
    const filteredData = selectedData.filter((d) => d.theta === thetaValue);

    // Dimensions and radius
    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 40;

    // Append SVG object to the ref
    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Scales
    const rScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.power)])
      .range([0, radius]);

    const angleScale = d3
      .scaleLinear()
      .domain([0, 360])
      .range([0, 2 * Math.PI]);

    // Line generator
    const line = d3
      .lineRadial()
      .angle((d) => angleScale(d.phi))
      .radius((d) => rScale(d.power))
      .curve(d3.curveLinear);

    // Draw the line
    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("d", line);

    // Drawing grid lines and labels for each 30 degrees, excluding 360
    for (let angle = 0; angle < 360; angle += 30) {
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", Math.sin(angleScale(angle)) * radius)
        .attr("y2", -Math.cos(angleScale(angle)) * radius)
        .attr("stroke", "lightgray")
        .attr("stroke-width", "1");

      // Adding labels for each angle
      svg
        .append("text")
        .attr("x", Math.sin(angleScale(angle)) * (radius + 10)) // Slightly beyond the end of the line
        .attr("y", -Math.cos(angleScale(angle)) * (radius + 10))
        .attr("text-anchor", "middle")
        .text(`${angle}°`);
    }
  }, [selectedData]); // Redraw graph when data or thetaValue changes

  return <svg ref={ref}></svg>;
}

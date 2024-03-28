import "./Form.css";
import logo from "../../assets/logo.png";
import ReactSwitch from "react-switch";
import { useState } from "react";

export default function Form({
  selectedFrequency,
  changeFrequency,
  formattedData,
  selectedView,
  setSelectedView,
  selectedMesh,
  setSelectedMesh,
  showPower,
  togglePower,
  selectedData,
  setSelectedDatasetIndex,
  selectedDatasetIndex,
  graphType,
  setGraphType,
  zeroAngle,
  setZeroAngle,
  zeroAngleValue,
  setZeroAngleValue,
}) {
  const frequencyOptions = Object.keys(selectedData?.["Phi"] || {}).map(
    (frequency) => (
      <option key={frequency} value={frequency}>
        {frequency}
      </option>
    )
  );
  const graphedAngle = zeroAngle === "theta" ? "phi" : "theta";
  const capitalizedZeroAngle =
    zeroAngle.charAt(0).toUpperCase() + zeroAngle.slice(1);

  const filteredData =
    selectedData && selectedData["Phi"]
      ? selectedData["Phi"][selectedFrequency]?.filter(
          (d) => d[graphedAngle] === 0
        )
      : [];

  const maxVaryingAngle =
    filteredData?.length > 0
      ? Math.max(...filteredData.map((item) => item[zeroAngle]))
      : 0;

  const varyingStepValue = maxVaryingAngle / (filteredData?.length - 1);

  const handleChange = (event) => {
    setZeroAngleValue(parseInt(event.target.value));
  };

  return (
    <div className="form-wrapper">
      <div className="selections-wrapper">
        <div
          className={`frequency-selection ${
            graphType === "line" ? "hidden-content" : ""
          }`}
        >
          <h3 className="frequency-label">Frequency (MHz):</h3>
          <select
            className="frequency-dropdown"
            value={selectedFrequency}
            onChange={(e) => changeFrequency(e.target.value)}
          >
            {frequencyOptions}
          </select>
        </div>
        <div className="view-selection">
          <button
            className={`polar-buttons ${
              selectedView === "parameters" ? "polar-buttons-selected" : ""
            }`}
            onClick={() => setSelectedView("parameters")}
          >
            Parameters
          </button>
          <button
            className={`polar-buttons ${
              selectedView === "graph" ? "polar-buttons-selected" : ""
            }`}
            onClick={() => setSelectedView("graph")}
          >
            Graph
          </button>
          <button
            className={`polar-buttons ${
              selectedView === "table" ? "polar-buttons-selected" : ""
            }`}
            onClick={() => setSelectedView("table")}
          >
            Table
          </button>
          {selectedView === "graph" && (
            <>
              <div className="graph-choice-wrapper">
                <button
                  className={`graph-option-button ${
                    graphType === "3D" ? "graph-option-selected" : ""
                  }`}
                  onClick={() => setGraphType("3D")}
                >
                  3D
                </button>
                <button
                  className={`graph-option-button ${
                    graphType === "polar" ? "graph-option-selected" : ""
                  }`}
                  onClick={() => setGraphType("polar")}
                >
                  Polar
                </button>
                <button
                  className={`graph-option-button ${
                    graphType === "line" ? "graph-option-selected" : ""
                  }`}
                  onClick={() => setGraphType("line")}
                >
                  Line
                </button>
              </div>
              {(graphType === "polar" || graphType === "line") && (
                <div className="angle-choice-wrapper">
                  <h3>Varying angle: </h3>
                  <button
                    className={`angle-choice-button ${
                      zeroAngle === "phi" ? "angle-choice-selected" : ""
                    }`}
                    onClick={() => {
                      setZeroAngle("phi");
                      setZeroAngleValue(0);
                    }}
                  >
                    Phi
                  </button>
                  <button
                    className={`angle-choice-button ${
                      zeroAngle === "theta" ? "angle-choice-selected" : ""
                    }`}
                    onClick={() => {
                      setZeroAngle("theta");
                      setZeroAngleValue(0);
                    }}
                  >
                    Theta
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={maxVaryingAngle}
                    value={zeroAngleValue}
                    onChange={handleChange}
                    step={varyingStepValue}
                    style={{ width: "100%" }}
                  />

                  <p className="angle-readout">{`${
                    zeroAngle.charAt(0).toUpperCase() + zeroAngle.slice(1)
                  } ${zeroAngleValue} °`}</p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="data-selection-wrapper">
          <button
            className={`data-buttons-left ${
              selectedDatasetIndex === 0 ? "data-selected" : ""
            }`}
            onClick={() => setSelectedDatasetIndex(0)}
          >
            Raw
          </button>
          <button
            className={`data-buttons-right ${
              selectedDatasetIndex === 1 ? "data-selected" : ""
            }`}
            onClick={() => setSelectedDatasetIndex(1)}
          >
            Final
          </button>
        </div>

        <div className="power-switch">
          <ReactSwitch checked={showPower} onChange={togglePower} />
          <p>Show power readout</p>
        </div>
      </div>
    </div>
  );
}

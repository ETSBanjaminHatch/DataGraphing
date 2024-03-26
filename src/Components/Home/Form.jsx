import "./Form.css";
import logo from "../../assets/logo.png";
import ReactSwitch from "react-switch";

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
}) {
  const frequencyOptions = Object.keys(
    formattedData[selectedDatasetIndex]?.["Phi"] || {}
  ).map((frequency) => (
    <option key={frequency} value={frequency}>
      {frequency}
    </option>
  ));

  return (
    <div className="form-wrapper">
      <div className="selections-wrapper">
        <div className="frequency-selection">
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
                  <button
                    className={`angle-choice-button ${
                      zeroAngle === "phi" ? "angle-choice-selected" : ""
                    }`}
                    onClick={() => setZeroAngle("phi")}
                  >
                    Phi
                  </button>
                  <button
                    className={`angle-choice-button ${
                      zeroAngle === "theta" ? "angle-choice-selected" : ""
                    }`}
                    onClick={() => setZeroAngle("theta")}
                  >
                    Theta
                  </button>
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

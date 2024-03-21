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
}) {
  const frequencyOptions = Object.keys(formattedData["Phi"] || {}).map(
    (frequency) => (
      <option key={frequency} value={frequency}>
        {frequency}
      </option>
    )
  );

  return (
    <div className="form-wrapper">
      <div className="title-wrapper">
        <img className="logo" src={logo} alt="Logo" />
      </div>
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
        </div>

        <div className="power-switch">
          <ReactSwitch checked={showPower} onChange={togglePower} />
          <p>Show power readout</p>
        </div>
      </div>
    </div>
  );
}

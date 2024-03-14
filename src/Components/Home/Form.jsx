import "./Form.css";
import logo from "../../assets/logo.png";

export default function Form({
  selectedFrequency,
  changeFrequency,
  formattedData,
  selectedView,
  setSelectedView,
  selectedMesh,
  setSelectedMesh,
}) {
  const frequencyButtons = Object.keys(formattedData["Phi"] || {}).map(
    (frequency) => (
      <button
        key={frequency}
        className={`polar-buttons ${
          selectedFrequency === frequency ? "polar-buttons-selected" : ""
        }`}
        onClick={() => changeFrequency(frequency)}
      >
        {frequency}
      </button>
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
          {frequencyButtons}
        </div>
        <div className="view-selection">
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
        <div className="mesh-selection">
          <button
            className={`polar-buttons ${
              selectedMesh === "ThreeJS" ? "polar-buttons-selected" : ""
            }`}
            onClick={() => setSelectedMesh("ThreeJS")}
          >
            ThreeJS
          </button>
          <button
            className={`polar-buttons ${
              selectedMesh === "Open3d" ? "polar-buttons-selected" : ""
            }`}
            onClick={() => setSelectedMesh("Open3d")}
          >
            Open3d (Python)
          </button>
        </div>
      </div>
    </div>
  );
}

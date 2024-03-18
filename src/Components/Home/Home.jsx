import "./Home.css";
import { useEffect, useState, useMemo } from "react";
import { latestData } from "../../assets/20180228";
import Form from "./Form";
import ThreejsMesh from "./ThreejsMesh";
import PointGraph from "./PointGraph";
import PythonMesh from "./PythonMesh";
import Table from "./Table";

//Home landing page that will show the form for graph selections and graphs.
export default function Home() {
  const [selectedFrequency, setSelectedFrequency] = useState();
  const [selectedView, setSelectedView] = useState("graph");
  const [selectedData, setSelectedData] = useState();
  const [selectedMesh, setSelectedMesh] = useState("ThreeJS");
  const [showPower, setShowPower] = useState(false);

  const polarizations = ["Phi", "Theta", "Total"];
  //Memoise the data to prevent unecessary re-renders
  const formattedData = useMemo(() => {
    return latestData.reduce((acc, obj) => {
      const { Polarization, Frequency, ...rest } = obj;

      if (!acc[Polarization]) {
        acc[Polarization] = {};
      }

      if (!acc[Polarization][Frequency]) {
        acc[Polarization][Frequency] = [];
      }

      acc[Polarization][Frequency].push({
        phi: rest["phi"],
        theta: rest["theta"],
        power: rest["power"],
      });

      return acc;
    }, {});
  }, [latestData]);

  function togglePower() {
    const changedPower = !showPower;
    setShowPower(changedPower);
  }

  function changeFrequency(selection) {
    setSelectedFrequency(selection);
  }

  //Sets the initial frequency based on the data
  useEffect(() => {
    const initialPolarizationData = formattedData["Phi"];

    if (initialPolarizationData) {
      const firstFrequency = Object.keys(initialPolarizationData)[0];

      setSelectedFrequency(firstFrequency);
    }
  }, [formattedData]);

  useEffect(() => {
    if (selectedFrequency) {
      setSelectedData(formattedData);
    }
  }, [formattedData, selectedFrequency]);

  return (
    <div className="home-wrapper">
      <Form
        selectedFrequency={selectedFrequency}
        changeFrequency={changeFrequency}
        formattedData={formattedData}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        selectedMesh={selectedMesh}
        setSelectedMesh={setSelectedMesh}
        showPower={showPower}
        togglePower={togglePower}
      />
      <div className="data-wrapper">
        {selectedView === "graph" &&
          selectedData &&
          selectedFrequency &&
          polarizations.map((pol) => {
            const dataForPolarization =
              selectedData[pol] && selectedData[pol][selectedFrequency];
            if (!dataForPolarization) return null;

            if (selectedMesh === "ThreeJS") {
              return (
                <ThreejsMesh
                  key={pol}
                  pol={pol}
                  selectedData={dataForPolarization}
                  showPower={showPower}
                />
              );
            } else if (selectedMesh === "Open3d") {
              return (
                <PythonMesh
                  key={pol}
                  pol={pol}
                  selectedData={dataForPolarization}
                  showPower={showPower}
                />
              );
            }
          })}
        {selectedView === "table" && selectedData && selectedFrequency && (
          <Table
            selectedData={selectedData}
            selectedFrequency={selectedFrequency}
          />
        )}
      </div>
    </div>
  );
}

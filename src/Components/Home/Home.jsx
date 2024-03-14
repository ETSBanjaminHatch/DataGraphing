import "./Home.css";
import { useEffect, useState, useMemo } from "react";
import { latestData } from "../../assets/20180228";
import Form from "./Form";

//Home landing page that will show the form for graph selections and graphs.
export default function Home() {
  const [selectedFrequency, setSelectedFrequency] = useState();
  const [selectedView, setSelectedView] = useState("graph");
  const [selectedData, setSelectedData] = useState();
  const [selectedMesh, setSelectedMesh] = useState("ThreeJS");

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
      />
    </div>
  );
}

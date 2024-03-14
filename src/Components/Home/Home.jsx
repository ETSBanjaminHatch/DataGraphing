import "./Home.css";
import { useEffect, useState, useMemo } from "react";
import { latestData } from "../../assets/20180228";

export default function Home() {
  const [selectedFrequency, setSelectedFrequency] = useState();
  const [selectedView, setSelectedView] = useState("graph");
  const [selectedData, setSelectedData] = useState();
  const [selectedMesh, setSelectedMesh] = useState("ThreeJS");

  const formattedData = useMemo(() => {
    return latestData.reduce((acc, obj) => {
      const { Polarization, Frequency: Frequency, ...rest } = obj;

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

  useEffect(() => {
    const initialPolarizationData = formattedData["phi"];

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

  console.log("selectedData", selectedData);
  return (
    <div className="home-wrapper">
      <h1>Home</h1>
    </div>
  );
}

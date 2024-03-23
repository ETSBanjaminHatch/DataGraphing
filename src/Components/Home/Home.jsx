import "./Home.css";
import { useEffect, useState, useMemo } from "react";
import { latestData } from "../../assets/20180228";
import Form from "./Form";
import ThreejsMesh from "./ThreejsMesh";
import PointGraph from "./PointGraph";
import PythonMesh from "./PythonMesh";
import Table from "./Table";
import Parameters from "./Parameters";
import logo from "../../assets/logo.png";
import TestSelection from "./TestSelection";

//Home landing page that will show the form for graph selections and graphs.
export default function Home() {
  const [selectedFrequency, setSelectedFrequency] = useState();
  const [selectedView, setSelectedView] = useState("graph");
  const [selectedData, setSelectedData] = useState();
  const [selectedMesh, setSelectedMesh] = useState("ThreeJS");
  const [showPower, setShowPower] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [paramsData, setParamsData] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [noTestWarning, setNoTestWarning] = useState(false);

  const polarizations = ["Theta", "Phi", "Total"];

  const processDataArray = (allData) => {
    const result = {};

    allData.forEach((dataArray) => {
      dataArray.Data.forEach(([frequency, polarization, theta, phi, power]) => {
        let polarizationKey;
        switch (polarization) {
          case 0:
            polarizationKey = "Theta";
            break;
          case 1:
            polarizationKey = "Phi";
            break;
          case 2:
            polarizationKey = "Total";
            break;
          default:
            polarizationKey = `Polarization ${polarization}`;
        }

        const frequencyKey = `${frequency}`;

        if (!result[polarizationKey]) {
          result[polarizationKey] = {};
        }

        if (!result[polarizationKey][frequencyKey]) {
          result[polarizationKey][frequencyKey] = [];
        }

        result[polarizationKey][frequencyKey].push({
          theta,
          phi,
          power,
        });
      });
    });

    return result;
  };

  async function fetchTestData() {
    if (!selectedTest) {
      setNoTestWarning(true);
      return;
    }
    setNoTestWarning(false);

    try {
      const response = await fetch(`/api/documents/${selectedTest}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setRawData(data[1].Data);
      console.log("RAW DATA: ", data[1].Data);
    } catch (error) {
      console.log("ERROR FETCHING DATA", error);
    }
  }

  const formattedData = useMemo(() => {
    const processData = (data) => {
      const result = {};
      if (Array.isArray(data)) {
        // console.log("data in process", data);
        data.forEach(([frequency, polarization, theta, phi, power]) => {
          let polarizationKey;
          switch (polarization) {
            case 0:
              polarizationKey = "Theta";
              break;
            case 1:
              polarizationKey = "Phi";
              break;
            case 2:
              polarizationKey = "Total";
              break;
            default:
              polarizationKey = `Polarization ${polarization}`;
          }

          const frequencyKey = `${frequency}`;

          if (!result[polarizationKey]) {
            result[polarizationKey] = {};
          }

          if (!result[polarizationKey][frequencyKey]) {
            result[polarizationKey][frequencyKey] = [];
          }

          result[polarizationKey][frequencyKey].push({
            theta,
            phi,
            power,
          });
        });
      }

      return result;
    };
    return processData(rawData);
  }, [rawData]);
  console.log("FORMATTTED DATA ", formattedData);
  // useEffect(() => {
  //   console.log("TEST");
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch("/api/testresults");
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       const data = await response.json();

  //       // console.log("data.data", data[1].Data);

  //       setRawData(data[1].Data);
  //     } catch (error) {
  //       console.error("There was an error fetching the data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    console.log("TEST");
    const fetchParams = async () => {
      try {
        const response = await fetch("/api/testparams");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const testList = data.map((test) => test._id);
        console.log("TEST LIST : ", testList);
        console.log("params data", data);
        setParamsData(data);
      } catch (error) {
        console.error("There was an error fetching the data:", error);
      }
    };

    fetchParams();
  }, []);

  function togglePower() {
    const changedPower = !showPower;
    setShowPower(changedPower);
  }

  function changeFrequency(selection) {
    setSelectedFrequency(selection);
  }

  //Sets the initial frequency based on the data
  useEffect(() => {
    const initialPolarizationData = formattedData["Theta"];

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
  console.log("SELECTED DATA", selectedData);
  return (
    <div className="home-wrapper">
      <div className="icon-testselection-wrapper">
        <div className="icon-wrapper">
          <img className="logo" src={logo} alt="Logo" />
        </div>
        <TestSelection
          selectedTest={selectedTest}
          setSelectedTest={setSelectedTest}
          fetchTestData={fetchTestData}
          noTestWarning={noTestWarning}
          setNoTestWarning={setNoTestWarning}
        />
      </div>
      <div className="form-data-wrapper">
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
          {selectedView === "parameters" && paramsData && (
            <Parameters paramsData={paramsData} />
          )}
          {selectedView === "graph" &&
            selectedData &&
            selectedFrequency &&
            polarizations.map((pol) => {
              const dataForPolarization =
                selectedData[pol] && selectedData[pol][selectedFrequency];
              if (!dataForPolarization) return null;

              return (
                <ThreejsMesh
                  key={pol}
                  pol={pol}
                  selectedData={dataForPolarization}
                  showPower={showPower}
                />
              );
            })}
          {selectedView === "table" && selectedData && selectedFrequency && (
            <Table
              selectedData={selectedData}
              selectedFrequency={selectedFrequency}
            />
          )}
        </div>
      </div>
    </div>
  );
}

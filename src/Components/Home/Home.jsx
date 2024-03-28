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
import TestMesh from "./TestMesh";
import PolarLineGraph from "./PolarGraph";
import D3PolarLineGraph from "./D3PolarLineGraph";
import RotatingObject from "./RotatingObject";
import LineGraph from "./LineGraph";

//Home landing page that will show the form for graph selections and graphs.
export default function Home() {
  const [selectedFrequency, setSelectedFrequency] = useState();
  const [selectedView, setSelectedView] = useState("graph");
  // const [selectedData, setSelectedData] = useState();
  const [selectedMesh, setSelectedMesh] = useState("ThreeJS");
  const [showPower, setShowPower] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [paramsData, setParamsData] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [noTestWarning, setNoTestWarning] = useState(false);
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState(1);
  const [tableData, setTableData] = useState(null);
  const [zeroAngle, setZeroAngle] = useState("theta");
  const [graphType, setGraphType] = useState("3D");
  const [zeroAngleValue, setZeroAngleValue] = useState(0);
  const [frequencies, setFrequencies] = useState(null);

  const polarizations = ["Theta", "Phi", "Total"];
  console.log("ALL FREQUENCIES STATE", frequencies);
  const newprocessDataArray = (allData) => {
    const result = allData.map((dataArray) => {
      const tempResult = {};
      dataArray.Data.forEach((dataPoint) => {
        const [frequency, polarization, theta, phi] = dataPoint;

        let power;

        if (dataPoint.length === 5) {
          [, , , , power] = dataPoint;
        } else if (dataPoint.length === 6) {
          const [, , , , Re, Im] = dataPoint;
          power = 20 * Math.log10(Math.sqrt(Re ** 2 + Im ** 2));
        }

        let polarizationKey =
          ["Theta", "Phi", "Total"][polarization] ||
          `Polarization ${polarization}`;
        const frequencyKey = `${frequency}`;

        if (!tempResult[polarizationKey]) {
          tempResult[polarizationKey] = {};
        }

        if (!tempResult[polarizationKey][frequencyKey]) {
          tempResult[polarizationKey][frequencyKey] = [];
        }

        tempResult[polarizationKey][frequencyKey].push({ theta, phi, power });
      });
      return tempResult;
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
      setRawData(data);
      console.log("RAW DATA: ", data);
    } catch (error) {
      console.log("ERROR FETCHING DATA", error);
    }
  }
  const formattedData = useMemo(() => newprocessDataArray(rawData), [rawData]);

  useEffect(() => {
    const fetchParams = async () => {
      console.log("FETCH PARAMS IN HOME");
      console.log(selectedTest);
      console.log(rawData);
      if (!selectedTest || rawData.length < 1) {
        console.log("IN IF STATEMETN");
        // Handle the case where no test is selected (maybe clear paramsData or set an error)
        // setParamsData(null);
        return;
      }
      console.log("PASSSWED IF STATEMNT!!!");
      try {
        // Adjust this URL to match your API's endpoint for fetching params by test ID
        const response = await fetch(`/api/testparams/${selectedTest}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        setParamsData(data);
      } catch (error) {
        console.error(
          "There was an error fetching the test parameters:",
          error
        );
        setParamsData(null); // Optionally clear paramsData on error
      }
    };

    fetchParams();
  }, [selectedTest, rawData]); // Rerun this effect when selectedTest changes

  function togglePower() {
    const changedPower = !showPower;
    setShowPower(changedPower);
  }

  function changeFrequency(selection) {
    console.log("CHANGE FREQUENCY", selection);
    setSelectedFrequency(selection);
  }

  //Sets the initial frequency based on the data
  useEffect(() => {
    const initialPolarizationData = selectedData["Theta"];

    if (initialPolarizationData) {
      const allFrequencies = Object.keys(initialPolarizationData);
      console.log("ALL FREQ", allFrequencies);
      const firstFrequency = Object.keys(initialPolarizationData)[0];
      setFrequencies(allFrequencies);
      setSelectedFrequency(firstFrequency);
    }
  }, [formattedData]);

  const selectedData = useMemo(() => {
    if (formattedData && formattedData.length > selectedDatasetIndex) {
      return formattedData[selectedDatasetIndex];
    }
    return {};
  }, [formattedData, selectedDatasetIndex]);

  const organizeRawData = (rawData) => {
    const organizedData = { Theta: {}, Phi: {}, Total: {} };

    rawData.Data.forEach((entry) => {
      const [frequency, polarizationCode, theta, phi, ...rest] = entry;
      const polarizationKey = ["Theta", "Phi", "Total"][polarizationCode];

      if (!organizedData[polarizationKey][frequency]) {
        organizedData[polarizationKey][frequency] = [];
      }

      organizedData[polarizationKey][frequency].push({
        theta,
        phi,
        data: rest,
      });
    });

    return organizedData;
  };
  useEffect(() => {
    if (!rawData || selectedDatasetIndex === null || !selectedFrequency) return;

    const organizedData = organizeRawData(rawData[selectedDatasetIndex]);

    const preprocessForTable = (organizedData, selectedFrequency) => {
      const tableData = {};

      Object.keys(organizedData).forEach((polarization) => {
        const frequencyData = organizedData[polarization][selectedFrequency];
        if (frequencyData) {
          tableData[polarization] = frequencyData.map((entry) => {
            const { theta, phi, data } = entry;
            let displayValue =
              data.length === 1
                ? data[0].toFixed(2)
                : `re:${data[0].toFixed(2)}, im:${data[1].toFixed(2)}`;

            return { theta, phi, displayValue };
          });
        }
      });

      return tableData;
    };

    const newTableData = preprocessForTable(organizedData, selectedFrequency);

    setTableData(newTableData);
  }, [rawData, selectedDatasetIndex, selectedFrequency]);

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
      {rawData.length < 1 && (
        <div className="rotate-object-wrapper">
          <RotatingObject />
        </div>
      )}
      {rawData.length > 1 && (
        <div className="form-data-wrapper">
          <Form
            selectedData={selectedData}
            selectedFrequency={selectedFrequency}
            changeFrequency={changeFrequency}
            formattedData={formattedData}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            selectedMesh={selectedMesh}
            setSelectedMesh={setSelectedMesh}
            showPower={showPower}
            togglePower={togglePower}
            selectedDatasetIndex={selectedDatasetIndex}
            setSelectedDatasetIndex={setSelectedDatasetIndex}
            graphType={graphType}
            setGraphType={setGraphType}
            zeroAngle={zeroAngle}
            setZeroAngle={setZeroAngle}
            zeroAngleValue={zeroAngleValue}
            setZeroAngleValue={setZeroAngleValue}
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

                if (graphType === "3D") {
                  return (
                    <ThreejsMesh
                      key={pol}
                      pol={pol}
                      selectedData={dataForPolarization}
                      showPower={showPower}
                    />
                  );
                } else if (graphType === "polar") {
                  return (
                    <PolarLineGraph
                      key={pol}
                      pol={pol}
                      zeroAngle={zeroAngle}
                      selectedData={dataForPolarization}
                      zeroAngleValue={zeroAngleValue}
                      setZeroAngleValue={setZeroAngleValue}
                      formattedData={formattedData[selectedDatasetIndex][pol]}
                    />
                  );
                } else if (graphType === "line") {
                  return (
                    <LineGraph
                      pol={pol}
                      selectedDatasetIndex={selectedDatasetIndex}
                      formattedData={formattedData}
                      frequencies={frequencies}
                      zeroAngleValue={zeroAngleValue}
                      zeroAngle={zeroAngle}
                    />
                  );
                }
              })}
            {selectedView === "table" && selectedData && selectedFrequency && (
              <Table
                tableData={tableData}
                selectedData={selectedData}
                selectedFrequency={selectedFrequency}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

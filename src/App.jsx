import "./App.css";
import Home from "./Components/Home/Home";
import { useEffect } from "react";

function App() {
  // const processDataArray = (allData) => {
  //   const result = {};

  //   allData.forEach((dataArray) => {
  //     dataArray.Data.forEach(([frequency, polarization, theta, phi, power]) => {
  //       let polarizationKey;
  //       switch (polarization) {
  //         case 0:
  //           polarizationKey = "Theta";
  //           break;
  //         case 1:
  //           polarizationKey = "Phi";
  //           break;
  //         case 2:
  //           polarizationKey = "Total";
  //           break;
  //         default:
  //           polarizationKey = `Polarization ${polarization}`;
  //       }

  //       const frequencyKey = `${frequency}`;

  //       if (!result[polarizationKey]) {
  //         result[polarizationKey] = {};
  //       }

  //       if (!result[polarizationKey][frequencyKey]) {
  //         result[polarizationKey][frequencyKey] = [];
  //       }

  //       result[polarizationKey][frequencyKey].push({
  //         theta,
  //         phi,
  //         power,
  //       });
  //     });
  //   });

  //   return result;
  // };

  // const processData = (data) => {
  //   const result = {};

  //   data.forEach(([frequency, polarization, theta, phi, power]) => {
  //     let polarizationKey;
  //     switch (polarization) {
  //       case 0:
  //         polarizationKey = "Theta";
  //         break;
  //       case 1:
  //         polarizationKey = "Phi";
  //         break;
  //       case 2:
  //         polarizationKey = "Total";
  //         break;
  //       default:
  //         polarizationKey = `Polarization ${polarization}`;
  //     }

  //     const frequencyKey = `${frequency}`;

  //     if (!result[polarizationKey]) {
  //       result[polarizationKey] = {};
  //     }

  //     if (!result[polarizationKey][frequencyKey]) {
  //       result[polarizationKey][frequencyKey] = [];
  //     }

  //     result[polarizationKey][frequencyKey].push({
  //       theta,
  //       phi,
  //       power,
  //     });
  //   });

  //   return result;
  // };
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch("/api/testresults");
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       const data = await response.json();
  //       console.log(data);
  //       console.log("data.data", data[1].Data);
  //       const processedData = processData(data[1].Data);
  //       console.log(processedData);
  //     } catch (error) {
  //       console.error("There was an error fetching the data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <div className="app-wrapper">
      <Home />
    </div>
  );
}

export default App;

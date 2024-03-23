import "./TestSelection.css";
import { useState, useEffect } from "react";

export default function TestSelection({
  selectedTest,
  setSelectedTest,
  noTestWarning,
  setNoTestWarning,
  fetchTestData,
}) {
  const [tests, setTests] = useState([]);

  //   async function fetchTestData() {
  //     if (!selectedTest) {
  //       setNoTestWarning(true);
  //       return;
  //     }
  //     setNoTestWarning(false);

  //     try {
  //       const response = await fetch(`/api/documents/${selectedTest}`);
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       const data = await response.json();
  //       console.log(data);
  //     } catch (error) {
  //       console.log("ERROR FETCHING DATA", error);
  //     }
  //   }
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
        console.log(testList);
        console.log("params data", data);
        setTests(testList);
      } catch (error) {
        console.error("There was an error fetching the data:", error);
      }
    };

    fetchParams();
  }, []);
  return (
    <div className="test-selection-wrapper">
      <p>Select test:</p>
      <ul>
        {tests.map((test) => (
          <li
            key={test}
            className={`test-item ${selectedTest === test ? "selected" : ""}`}
            onClick={() => setSelectedTest(test)}
          >
            {test}
          </li>
        ))}
      </ul>
      <button onClick={fetchTestData} className="load-test-button">
        Load test
      </button>
      {noTestWarning && (
        <p className="no-test-warning">Please select a test.</p>
      )}
    </div>
  );
}

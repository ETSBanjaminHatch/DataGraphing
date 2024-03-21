import "./Table.css";

export default function Table({ selectedData, selectedFrequency }) {
  console.log("SELECTED IN TABLE", selectedData);
  const organizeData = (data) => {
    if (!data) return {};
    const organizedData = {};
    data.forEach(({ theta, phi, power }) => {
      const shortenedPower = power.toFixed(2);
      if (!organizedData[phi]) {
        organizedData[phi] = {};
      }
      organizedData[phi][theta] = shortenedPower;
    });
    return organizedData;
  };

  const phiData = selectedData["Phi"]
    ? selectedData["Phi"][selectedFrequency]
    : null;
  const thetaData = selectedData["Theta"]
    ? selectedData["Theta"][selectedFrequency]
    : null;
  const totalData = selectedData["Total"]
    ? selectedData["Total"][selectedFrequency]
    : null;

  const organizedPhiData = organizeData(phiData);
  const organizedThetaData = organizeData(thetaData);
  const organizedTotalData = organizeData(totalData);

  const generateTable = (organizedData, title) => {
    if (Object.keys(organizedData).length === 0) {
      return null;
    }
    return (
      <div className="table-wrapper">
        <h3>{title}</h3>
        <table>
          <thead>
            <tr>
              <th style={{ border: "none", background: "none" }}></th>
              <th
                colSpan={
                  Object.keys(organizedData[Object.keys(organizedData)[0]])
                    .length
                }
                style={{ textAlign: "center" }}
              >
                Theta Values
              </th>
            </tr>
            <tr>
              <th>Phi</th>
              {Object.keys(organizedData[Object.keys(organizedData)[0]]).map(
                (theta) => (
                  <th key={theta}>{theta}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {Object.keys(organizedData).map((phi) => (
              <tr key={phi}>
                <th scope="row">{phi}</th>
                {Object.keys(organizedData[phi]).map((theta) => (
                  <td key={theta}>
                    {organizedData[phi][theta] !== undefined
                      ? organizedData[phi][theta]
                      : "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="tables-wrapper">
      {thetaData && generateTable(organizedThetaData, "Theta Polarization:")}
      {phiData && generateTable(organizedPhiData, "Phi Polarization:")}
      {totalData && generateTable(organizedTotalData, "Total Polarization:")}
    </div>
  );
}

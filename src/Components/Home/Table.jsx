import "./Table.css";

export default function Table({ tableData }) {
  const generateTable = (data, title) => {
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    const thetas = [...new Set(data.map((item) => item.theta))].sort(
      (a, b) => a - b
    );
    const phis = [...new Set(data.map((item) => item.phi))].sort(
      (a, b) => a - b
    );

    return (
      <div className="table-wrapper">
        <h3>{title}</h3>
        <table>
          <thead>
            <tr>
              <th style={{ border: "none", background: "none" }}></th>
              <th colSpan={thetas.length} style={{ textAlign: "center" }}>
                Theta Values
              </th>
            </tr>
            <tr>
              <th>Phi</th>
              {thetas.map((theta) => (
                <th key={theta}>{theta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {phis.map((phi) => (
              <tr key={phi}>
                <th>{phi}</th>
                {thetas.map((theta) => {
                  const item = data.find(
                    (d) => d.theta === theta && d.phi === phi
                  );
                  return (
                    <td key={theta}>{item ? item.displayValue : "N/A"}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="tables-wrapper">
      {Object.entries(tableData).map(([polarization, data]) =>
        generateTable(data, `${polarization} Polarization:`)
      )}
    </div>
  );
}

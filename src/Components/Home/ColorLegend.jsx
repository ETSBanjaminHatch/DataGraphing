export default function ColorLegend({ min, max }) {
  max = max + max * 0.1;
  min = min - min * 0.1;
  const middle = (min + max) / 2;

  return (
    <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
      <div
        style={{ height: "300px", position: "relative", marginRight: "10px" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "100%",
            color: "black",
          }}
        >
          {max.toFixed(0)}
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            right: "100%",
            color: "black",
          }}
        >
          {middle.toFixed(0)}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: "100%",
            color: "black",
          }}
        >
          {min.toFixed(0)}
        </div>
      </div>

      <div
        style={{
          height: "300px",
          width: "20px",
          background:
            "linear-gradient(to top, purple, navy, blue, aqua, lime, yellow, red)",
        }}
      ></div>
    </div>
  );
}

export function analyzeDataStructure(data) {
  const thetaValues = data.map((item) => item.theta);
  const phiValues = data.map((item) => item.phi);

  const thetaRange = {
    min: Math.min(...thetaValues),
    max: Math.max(...thetaValues),
  };
  const phiRange = {
    min: Math.min(...phiValues),
    max: Math.max(...phiValues),
  };

  if (thetaRange.max - thetaRange.min > phiRange.max - phiRange.min) {
    return "theta_varying";
  } else {
    return "phi_varying";
  }
}

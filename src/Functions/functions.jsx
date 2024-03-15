import * as THREE from "three";
class PointRThetaPhi {
  constructor(phi, theta, radius) {
    this.phi = phi;
    this.theta = theta;
    this.radius = radius;
    this.power = radius;
  }
}

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

export function getColorForValue(value, min, max) {
  const ratio = (value - min) / (max - min);

  const gradientColors = [
    { pos: 0, color: new THREE.Color(0x800080) }, // Purple
    { pos: 1 / 6, color: new THREE.Color(0x000080) }, // Navy
    { pos: 2 / 6, color: new THREE.Color(0x0000ff) }, // Blue
    { pos: 3 / 6, color: new THREE.Color(0x00ffff) }, // Aqua
    { pos: 4 / 6, color: new THREE.Color(0x00ff00) }, // Lime
    { pos: 5 / 6, color: new THREE.Color(0xffff00) }, // Yellow
    { pos: 1, color: new THREE.Color(0xff0000) }, // Red
  ];

  for (let i = 0; i < gradientColors.length - 1; i++) {
    const start = gradientColors[i];
    const end = gradientColors[i + 1];
    if (ratio >= start.pos && ratio < end.pos) {
      const localRatio = (ratio - start.pos) / (end.pos - start.pos);
      return start.color.clone().lerp(end.color, localRatio);
    }
  }

  return gradientColors[gradientColors.length - 1].color;
}

export function interpolate(x, x0, y0, x1, y1) {
  if (x1 - x0 === 0) {
    return (y0 + y1) / 2;
  }
  let f = (x - x0) / (x1 - x0);
  return y0 + f * (y1 - y0);
}

export function interpolatePoints(points, stepValue) {
  let pointsI = [];
  let pointsI2 = [];

  // Interpolate Phi
  let prevIndex = 0;
  for (let i = 0; i < points.length; i++) {
    if (i > 0 && points[i].phi !== points[i - 1].phi) {
      let newPhi = points[i - 1].phi + stepValue;
      while (newPhi < points[i].phi) {
        for (let k = 0; k < i - prevIndex; k++) {
          if (i + k < points.length) {
            let point = new PointRThetaPhi(
              newPhi,
              points[prevIndex + k].theta,
              interpolate(
                newPhi,
                points[i - 1].phi,
                points[prevIndex + k].radius,
                points[i].phi,
                points[i + k].radius
              )
            );
            pointsI.push(point);
          }
        }
        newPhi += stepValue;
      }
      prevIndex = i;
    }
    pointsI.push(points[i]);
  }

  // Interpolate Theta
  for (let i = 0; i < pointsI.length - 1; i++) {
    if (i > 0 && pointsI[i].phi !== pointsI[i + 1].phi) {
      pointsI2.push(pointsI[i]);
      continue;
    }

    pointsI2.push(pointsI[i]);
    let newTheta = pointsI[i].theta + stepValue;
    while (newTheta < pointsI[i + 1].theta) {
      let point = new PointRThetaPhi(
        pointsI[i].phi,
        newTheta,
        interpolate(
          newTheta,
          pointsI[i].theta,
          pointsI[i].radius,
          pointsI[i + 1].theta,
          pointsI[i + 1].radius
        )
      );
      pointsI2.push(point);
      newTheta += stepValue;
    }
  }

  pointsI2.push(pointsI[pointsI.length - 1]);

  return pointsI2;
}

export function filterOutliers(data, threshold) {
  const powers = data.map((entry) => entry.power);

  const meanPower =
    powers.reduce((sum, power) => sum + power, 0) / powers.length;
  const stdPower = Math.sqrt(
    powers.reduce((sum, power) => sum + Math.pow(power - meanPower, 2), 0) /
      powers.length
  );

  return data.filter((entry) => {
    const zScore = (entry.power - meanPower) / stdPower;
    return Math.abs(zScore) <= threshold;
  });
}

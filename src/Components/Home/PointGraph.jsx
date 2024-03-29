import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./PointGraph.css";
import { filterOutliers, interpolatePoints } from "../../Functions/functions";

class PointRThetaPhi {
  constructor(phi, theta, radius) {
    this.phi = phi;
    this.theta = theta;
    this.radius = radius;
  }
}

export default function PointGraph({ selectedData, pol }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const pointsRef = useRef(null);

  function interpolateBetweenTwoPoints(p1, p2, steps) {
    let interpolatedPoints = [];
    if (!p1 || !p2) {
      console.warn("Undefined point encountered in interpolation:", { p1, p2 });
      return interpolatedPoints; // Return an empty array if either point is undefined
    }
    for (let step = 1; step < steps; step++) {
      const t = step / steps;
      const interpolatedTheta = lerp(p1.theta, p2.theta, t);
      const interpolatedPhi = lerp(p1.phi, p2.phi, t);
      const interpolatedRadius = lerp(p1.radius, p2.radius, t);
      interpolatedPoints.push(
        new PointRThetaPhi(
          interpolatedPhi,
          interpolatedTheta,
          interpolatedRadius
        )
      );
    }
    return interpolatedPoints;
  }

  function generateInterpolatedGrid(points, thetaSteps, phiSteps) {
    let finalInterpolated = [];

    // Assuming points are sorted and organized by theta then phi
    const thetaGrouped = groupByTheta(points);
    const thetaValues = Object.keys(thetaGrouped)
      .map(Number)
      .sort((a, b) => a - b);

    // Interpolate across theta for each phi
    thetaValues.forEach((theta, index) => {
      if (index < thetaValues.length - 1) {
        const nextTheta = thetaValues[index + 1];
        const currentPoints = thetaGrouped[theta];
        const nextPoints = thetaGrouped[nextTheta];

        // Now, interpolate between currentPoints and nextPoints for each phi
        currentPoints.forEach((point, pointIndex) => {
          if (pointIndex < currentPoints.length - 1) {
            // Check to ensure matching next point exists
            const nextPoint = nextPoints[pointIndex];
            // Interpolate between point and nextPoint across theta
            const interpolatedThetaPoints = interpolateBetweenTwoPoints(
              point,
              nextPoint,
              thetaSteps
            );
            finalInterpolated.push(...interpolatedThetaPoints);
          }
        });
      }
    });

    // Now, handle phi interpolation separately to ensure phiSteps are accounted for
    const allPhiValues = [...new Set(points.map((p) => p.phi))].sort(
      (a, b) => a - b
    );

    allPhiValues.forEach((phi, index) => {
      if (index < allPhiValues.length - 1) {
        const nextPhi = allPhiValues[index + 1];
        // Filter points for current and next phi values, sorted by theta to align
        const currentPhiPoints = points
          .filter((p) => p.phi === phi)
          .sort((a, b) => a.theta - b.theta);
        const nextPhiPoints = points
          .filter((p) => p.phi === nextPhi)
          .sort((a, b) => a.theta - b.theta);

        // Ensure we have matching pairs to interpolate between
        currentPhiPoints.forEach((point, pointIndex) => {
          if (pointIndex < currentPhiPoints.length - 1) {
            const matchingNextPoint = nextPhiPoints[pointIndex]; // Assuming matching index
            // Interpolate between point and matchingNextPoint across phi
            const interpolatedPhiPoints = interpolateBetweenTwoPoints(
              point,
              matchingNextPoint,
              phiSteps
            );
            finalInterpolated.push(...interpolatedPhiPoints);
          }
        });
      }
    });

    return finalInterpolated;
  }

  function lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  function groupByTheta(points) {
    let groups = {};
    points.forEach((point) => {
      const key = point.theta;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(point);
    });
    return groups;
  }

  function createTextLabel(text, position) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "48px Arial";
    context.fillStyle = "white";
    context.fillText(text, 0, 36);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(10, 5, 1);
    return sprite;
  }

  function addAxisLinesAndLabels(scene, axLength) {
    const axisLength = axLength;
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    // X Axis
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLength, 0, 0),
      new THREE.Vector3(axisLength, 0, 0),
    ]);
    const xAxis = new THREE.Line(xAxisGeometry, axisMaterial);
    scene.add(xAxis);

    // Y Axis
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -axisLength, 0),
      new THREE.Vector3(0, axisLength, 0),
    ]);
    const yAxis = new THREE.Line(yAxisGeometry, axisMaterial);
    scene.add(yAxis);

    // Z Axis
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLength),
      new THREE.Vector3(0, 0, axisLength),
    ]);
    const zAxis = new THREE.Line(zAxisGeometry, axisMaterial);
    scene.add(zAxis);

    // Adding Labels
    const xOffset = 0.5;
    const yOffset = -2;
    const zOffset = 0.5;

    const xLabel = createTextLabel(
      "X",
      new THREE.Vector3(axisLength + xOffset, 0, 0)
    );
    const yLabel = createTextLabel(
      "Y",
      new THREE.Vector3(0, axisLength + yOffset, 0)
    );
    const zLabel = createTextLabel(
      "Z",
      new THREE.Vector3(0, 0, axisLength + zOffset)
    );

    scene.add(xLabel);
    scene.add(yLabel);
    scene.add(zLabel);
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(40, 40, 40);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(550, 500);
    containerRef.current.appendChild(renderer.domElement);

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Static elements: axis lines and labels
    addAxisLinesAndLabels(scene);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      if (
        containerRef.current &&
        renderer.domElement &&
        document.body.contains(renderer.domElement)
      ) {
        containerRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !selectedData || selectedData.length === 0) return;

    const geometry = new THREE.BufferGeometry();

    const filteredData = selectedData;

    let newpoints = filteredData.map(
      (d) => new PointRThetaPhi(d.phi, d.theta, d.power)
    );

    let minR = Infinity;
    newpoints.forEach((point) => {
      if (point.radius < minR) {
        minR = point.radius;
      }
    });
    if (minR < 0) {
      newpoints.forEach((point) => {
        point.radius -= minR;
      });
    }
    let interP = newpoints;
    console.log(interP);
    let cartesianData = interP.map((point) => {
      const r = point.radius;
      const thetaRadians = THREE.MathUtils.degToRad(point.theta);
      const phiRadians = THREE.MathUtils.degToRad(point.phi);
      const x = r * Math.sin(thetaRadians) * Math.cos(phiRadians);
      const y = r * Math.sin(thetaRadians) * Math.sin(phiRadians);
      const z = r * Math.cos(thetaRadians);
      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        console.log("NaN detected in computed values:", { x, y, z });
      }
      return [x, y, z];
    });

    let maxDistance = 0;
    cartesianData.forEach(([x, y, z]) => {
      const distance = Math.sqrt(x * x + y * y + z * z);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    });
    const axisLength = maxDistance * 1.1;
    addAxisLinesAndLabels(sceneRef.current, axisLength);
    let newcartesianData = cartesianData.flat();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(newcartesianData, 3)
    );
    const material = new THREE.PointsMaterial({ color: 0x9393e1 });

    if (pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
    }

    const points = new THREE.Points(geometry, material);
    sceneRef.current.add(points);
    pointsRef.current = points;
  }, [selectedData]);

  return (
    <div className="pointcloud-wrapper">
      <div className="point-title">
        <h2>{pol}</h2>
      </div>
      <div className="pointcloud" ref={containerRef} />
    </div>
  );
}

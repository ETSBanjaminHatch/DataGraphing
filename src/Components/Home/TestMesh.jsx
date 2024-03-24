import "./ThreejsMesh.css";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ColorLegend from "./ColorLegend";
import {
  filterOutliers,
  interpolatePoints,
  getColorForValue,
  analyzeDataStructure,
} from "../../Functions/functions";
import ReactSwitch from "react-switch";

class PointRThetaPhi {
  constructor(phi, theta, radius) {
    this.phi = phi;
    this.theta = theta;
    this.radius = radius;
  }
}

export default function TestMesh({ pol, selectedData, showPower }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const surfaceRef = useRef(null);
  const hoveredPowerRef = useRef(null);
  const tooltipPosRef = useRef({ x: 0, y: 0 });
  const showTooltipRef = useRef(false);
  const tooltipDivRef = useRef(null);
  const powerMappingRef = useRef(null);
  const minimumRRef = useRef(null);

  const [minPower, setMinPower] = useState(0);
  const [maxPower, setMaxPower] = useState(0);

  function createTextLabel(text, position) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "50px Arial";
    context.fillStyle = "black";
    context.fillText(text, 0, 36);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(10, 5, 1);
    return sprite;
  }

  function addAxisLinesAndLabels(scene) {
    const axisLength = 50;
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

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

  //   function analyzeData(data) {
  //     // Analyze data to determine the structure
  //     const thetaValues = new Set();
  //     const phiValues = new Set();
  //     data.forEach((point) => {
  //       thetaValues.add(point.theta);
  //       phiValues.add(point.phi);
  //     });

  //     console.log("THETA VALUES : ", thetaValues);
  //     console.log("PHI VALUES", phiValues);

  //     // Determine if Theta or Phi varies more significantly
  //     const varying = thetaValues.size > phiValues.size ? "Theta" : "Phi";
  //     const steps = varying === "Theta" ? phiValues.size : thetaValues.size;

  //     return {
  //       varying,
  //       steps, // This represents how many distinct values are there for the less varying angle
  //     };
  //   }
  function analyzeVariation(data) {
    const thetaValues = new Set();
    const phiValues = new Set();

    // Collect unique theta and phi values
    data.slice(0, 15).forEach((point) => {
      thetaValues.add(point.theta);
      phiValues.add(point.phi);
    });
    const thetaSteps = new Set();
    const phiSteps = new Set();
    data.forEach((point) => {
      thetaSteps.add(point.theta);
      phiSteps.add(point.phi);
    });
    console.log("THETA", thetaValues.size);
    console.log("PHI", phiValues.size);
    if (thetaValues.size > phiValues.size) {
      return { varying: "Theta", steps: thetaSteps.size };
    } else {
      return { varying: "Phi", steps: phiSteps.size };
    }
  }
  function generateIndices(data) {
    const { varying, steps } = analyzeVariation(data);
    const indices = [];

    if (varying === "Phi") {
      const thetaLevels = new Set(data.map((d) => d.theta)).size;
      const phiLevels = data.length / thetaLevels;
      for (let t = 0; t < thetaLevels - 1; t++) {
        for (let p = 0; p < phiLevels; p++) {
          const current = t * phiLevels + p;
          const next = current + phiLevels;

          // Connect the dots to form two triangles for each square in the grid
          indices.push(current, next, ((p + 1) % phiLevels) + t * phiLevels);
          indices.push(
            ((p + 1) % phiLevels) + t * phiLevels,
            next,
            ((p + 1) % phiLevels) + (t + 1) * phiLevels
          );
        }
      }
    } else {
      // Assuming Phi varies for every Theta (This case should be adjusted based on your actual data structure)
      const phiLevels = steps;
      const thetaLevels = data.length / phiLevels;
      for (let t = 0; t < thetaLevels - 1; t++) {
        for (let p = 0; p < phiLevels; p++) {
          const current = t * phiLevels + p;
          const next = current + phiLevels;

          indices.push(current, next, ((p + 1) % phiLevels) + t * phiLevels);
          indices.push(
            ((p + 1) % phiLevels) + t * phiLevels,
            next,
            ((p + 1) % phiLevels) + (t + 1) * phiLevels
          );
        }
      }
    }

    return indices;
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f8ff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(550, 500);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    addAxisLinesAndLabels(scene);

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const mouse = new THREE.Vector2(
        (x / renderer.domElement.clientWidth) * 2 - 1,
        -(y / renderer.domElement.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      if (surfaceRef.current) {
        const intersects = raycaster.intersectObject(surfaceRef.current);

        if (intersects.length > 0) {
          const index = intersects[0].face.a;

          const powerValue =
            powerMappingRef.current[index] + minimumRRef.current;

          if (powerValue) {
            hoveredPowerRef.current = powerValue.toFixed(2);
            tooltipPosRef.current = { x: event.clientX + 10, y: event.clientY };
            showTooltipRef.current = true;
          } else {
            showTooltipRef.current = false;
          }
        } else {
          showTooltipRef.current = false;
        }
      }

      // Manually manage tooltip visibility and content
      if (tooltipDivRef.current) {
        if (showTooltipRef.current) {
          tooltipDivRef.current.style.display = "block";
          tooltipDivRef.current.style.left = `${tooltipPosRef.current.x}px`;
          tooltipDivRef.current.style.top = `${tooltipPosRef.current.y}px`;
          tooltipDivRef.current.textContent = `Power: ${hoveredPowerRef.current}`;
        } else {
          tooltipDivRef.current.style.display = "none";
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (
        containerRef.current &&
        renderer.domElement &&
        document.body.contains(renderer.domElement)
      ) {
        containerRef.current.removeChild(renderer.domElement);
        renderer.domElement.removeEventListener("mousemove", onMouseMove);
      }
      controls.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !selectedData) return;
    const filteredData = filterOutliers(selectedData, 7.5);
    let newPoints = filteredData.map(
      (d) => new PointRThetaPhi(d.phi, d.theta, d.power)
    );
    console.log("SELECTED DATA", selectedData);
    const powers = newPoints.map((p) => p.radius);
    const minPower = Math.min(...powers);
    const maxPower = Math.max(...powers);
    setMinPower(Math.min(...powers));
    setMaxPower(Math.max(...powers));
    let minR = Infinity;
    newPoints.forEach((point) => {
      if (point.radius < minR) {
        minR = point.radius;
      }
    });

    if (minR < 0) {
      minimumRRef.current = minR;
      newPoints.forEach((point) => {
        point.radius -= minR;
      });
    }

    let interP = newPoints;
    console.log("INTERP", interP);

    if (pol === "Total") {
      minR = 0;
    }

    const vertices = [];
    const colors = [];
    interP.forEach((point) => {
      const color = getColorForValue(point.radius + minR, minPower, maxPower);
      colors.push(color.r, color.g, color.b);
    });

    let newPowerMapping = interP.map((point) => point.radius);

    powerMappingRef.current = newPowerMapping;

    interP.forEach((point) => {
      const phiRad = THREE.MathUtils.degToRad(point.phi);
      const thetaRad = THREE.MathUtils.degToRad(point.theta);
      const x = point.radius * Math.sin(thetaRad) * Math.cos(phiRad);
      const y = point.radius * Math.sin(thetaRad) * Math.sin(phiRad);
      const z = point.radius * Math.cos(thetaRad);

      vertices.push(x, y, z);
    });

    const indices = generateIndices(interP);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices.flat(), 3)
    );
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors.flat(), 3)
    );

    geometry.setIndex(indices);

    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 1,
    });
    const wireframe = new THREE.LineSegments(
      wireframeGeometry,
      wireframeMaterial
    );

    // Remove previous mesh from the scene and dispose of its resources
    if (surfaceRef.current) {
      sceneRef.current.remove(surfaceRef.current);
      surfaceRef.current.geometry.dispose();
      surfaceRef.current.material.dispose();
    }

    // Create the new mesh with vertex colors and add it to the scene
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
    });
    const surface = new THREE.Mesh(geometry, material);
    surface.add(wireframe);
    sceneRef.current.add(surface);

    surfaceRef.current = surface;
  }, [selectedData]);

  return (
    <div className="threejs-wrapper">
      <div className="mesh-title">
        <h2>{pol}</h2>
        {showPower && (
          <div
            ref={tooltipDivRef}
            style={{
              display: "none", // Start with the tooltip hidden
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              color: "white",
              padding: "5px",
              borderRadius: "4px",
              pointerEvents: "none", // Ensures the tooltip doesn't interfere with mouse events
            }}
          ></div>
        )}
      </div>
      <div className="meshgraph-wrapper">
        <div className="meshgraph" ref={containerRef} />
        <ColorLegend min={minPower} max={maxPower} />
      </div>
    </div>
  );
}

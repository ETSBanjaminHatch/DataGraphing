import "./PythonMesh.css";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ColorLegend from "./ColorLegend";
import {
  filterOutliers,
  interpolatePoints,
  getColorForValue,
} from "../../Functions/functions";
import ReactSwitch from "react-switch";

class PointRThetaPhi {
  constructor(phi, theta, radius) {
    this.phi = phi;
    this.theta = theta;
    this.radius = radius;
    this.power = radius;
  }
}

export default function PythonMesh({ pol, selectedData, showPower }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const surfaceRef = useRef(null);
  const meshRef = useRef(null);
  const hoveredPowerRef = useRef(null);
  const tooltipPosRef = useRef({ x: 0, y: 0 });
  const showTooltipRef = useRef(false);
  const tooltipDivRef = useRef(null);
  const powerMappingRef = useRef(null);
  const minimumRRef = useRef(null);

  const [minPower, setMinPower] = useState(0);
  const [maxPower, setMaxPower] = useState(0);

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

  function drawMesh(vertices, faces, colors) {
    if (sceneRef.current) {
      if (meshRef.current) {
        if (meshRef.current.solid && sceneRef.current)
          sceneRef.current.remove(meshRef.current.solid);
        if (meshRef.current.wireframe && sceneRef.current)
          sceneRef.current.remove(meshRef.current.wireframe);
      }

      const geometry = new THREE.BufferGeometry();
      const verticesArray = new Float32Array(vertices.flat());
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(verticesArray, 3)
      );
      console.log("Vertices length:", vertices.length);
      console.log("Colors array length:", colors.length);

      const colorsArray = new Float32Array(colors);

      geometry.setAttribute("color", new THREE.BufferAttribute(colorsArray, 3));

      const facesArray = new Uint16Array(faces.flat());
      geometry.setIndex(new THREE.BufferAttribute(facesArray, 1));
      geometry.computeVertexNormals();
      const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        vertexColors: true,
      });
      //   const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const mesh = new THREE.Mesh(geometry, material);
      sceneRef.current.add(mesh);
      surfaceRef.current = mesh;
      const wireframeGeometry = new THREE.WireframeGeometry(geometry);
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 1,
      });
      const wireframe = new THREE.LineSegments(
        wireframeGeometry,
        wireframeMaterial
      );
      sceneRef.current.add(wireframe);

      // Keep reference to both meshes for possible removal or manipulation later
      meshRef.current = { solid: mesh, wireframe: wireframe };
    }
  }

  async function fetchMeshData(fetchingData, colors) {
    try {
      console.log("FETCHING DATA: ", fetchingData);
      if (fetchingData.length > 0) {
        const response = await fetch("http://localhost:5000/reconstruct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ points: fetchingData }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        drawMesh(data.vertices, data.triangles, colors);
      }
    } catch (error) {
      console.error("Could not fetch mesh data:", error);
    }
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
      console.log("SHOW POWER", showPower);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      if (surfaceRef.current) {
        const intersects = raycaster.intersectObject(surfaceRef.current);

        if (intersects.length > 0) {
          const index = intersects[0].face.a;
          console.log("INDEX", index);
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
    if (!sceneRef.current) return;
    if (!selectedData) return;

    // const geometry = new THREE.BufferGeometry();
    if (surfaceRef.current) {
      sceneRef.current.remove(surfaceRef.current);
      surfaceRef.current.geometry.dispose();
      surfaceRef.current.material.dispose();
    }

    const filteredData = filterOutliers(selectedData, 7.5);

    let newPoints = filteredData.map(
      (d) => new PointRThetaPhi(d.phi, d.theta, d.power)
    );

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

    let interP = generateInterpolatedGrid(newPoints, 5, 5);

    if (pol === "Total") {
      minR = 0;
    }
    const colors = [];
    interP.forEach((point) => {
      const color = getColorForValue(point.radius, minPower, maxPower);
      colors.push(color.r, color.g, color.b);
    });

    let newPowerMapping = interP.map((point) => point.radius);

    powerMappingRef.current = newPowerMapping;
    let cartesianData = interP.map((point) => {
      const r = point.radius;
      const thetaRadians = THREE.MathUtils.degToRad(point.theta);
      const phiRadians = THREE.MathUtils.degToRad(point.phi);
      const x = r * Math.sin(thetaRadians) * Math.cos(phiRadians);
      const y = r * Math.sin(thetaRadians) * Math.sin(phiRadians);
      const z = r * Math.cos(thetaRadians);
      return [x, y, z];
    });

    fetchMeshData(cartesianData, colors);
  }, [selectedData]);

  return (
    <div className="pythonmesh-wrapper">
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
      <div className="pythonmeshgraph-wrapper">
        <div className="pointcloud" ref={containerRef} />
        <ColorLegend min={minPower} max={maxPower} />
      </div>
    </div>
  );
}

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

  function createTextLabel(text, position) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "36px Arial";
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

  function addAxisLinesAndLabels(scene) {
    const axisLength = 50;
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

    const filteredData = filterOutliers(selectedData, 7.5);

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

    let interP = interpolatePoints(newpoints, 7.5);

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

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./App.css";

export default function App() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0xdddddd })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Expose helpers
    window.addBrick = () => {
      const brick = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xc0392b })
      );
      brick.position.set(0, 0.25, 0);
      scene.add(brick);
    };

    return () => mountRef.current.removeChild(renderer.domElement);
  }, []);

  return (
    <div className="app">
      <div className="env">
        <div className="label red">Environment</div>
        <div className="scene" ref={mountRef}></div>
      </div>

      <div className="objects">
        <div className="label blue">Objects</div>
        <button onClick={() => window.addBrick()}>Brick</button>
      </div>
    </div>
  );
}

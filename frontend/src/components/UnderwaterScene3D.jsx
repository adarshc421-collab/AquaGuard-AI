import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CATEGORY_COLORS } from '../constants/debrisData';
import { Box, RotateCcw, ZoomIn, Eye, Sparkles, Layers, Info, ShieldAlert, CheckCircle } from 'lucide-react';

export default function UnderwaterScene3D({
  detections = [],
  selectedDetId,
  setSelectedDetId
}) {
  const mountRef = useRef(null);
  const [sceneBuilt, setSceneBuilt] = useState(true);
  const [cameraInfo, setCameraInfo] = useState({ depth: '2.5m', angle: 'Top-Oblique' });
  const selectedDet = detections.find(d => d.id === selectedDetId) || detections[0];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 450;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020f20);
    scene.fog = new THREE.FogExp2(0x021730, 0.045);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 7, 10);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.replaceChildren(renderer.domElement);

    // 3. Lighting (Caustic sunlight + underwater deep ambient)
    const ambientLight = new THREE.AmbientLight(0x0f4d75, 1.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00f2fe, 2.0);
    sunLight.position.set(5, 15, 8);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const deepLight = new THREE.PointLight(0x00e676, 1.2, 20);
    deepLight.position.set(-4, 3, -2);
    scene.add(deepLight);

    // 4. Sandy Seabed Terrain Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24, 32, 32);
    const pos = floorGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      pos.setZ(i, Math.sin(vx * 0.5) * 0.3 + Math.cos(vy * 0.4) * 0.2);
    }
    floorGeo.computeVertexNormals();

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x092b42,
      roughness: 0.85,
      metalness: 0.1,
      wireframe: false,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper on seafloor
    const gridHelper = new THREE.GridHelper(24, 16, 0x00f2fe, 0x073559);
    gridHelper.position.y = -2.48;
    scene.add(gridHelper);

    // 5. Water Surface Reference Plane
    const surfaceGeo = new THREE.PlaneGeometry(24, 24);
    const surfaceMat = new THREE.MeshBasicMaterial({
      color: 0x00a8cc,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 3.5;
    scene.add(surface);

    // 6. Ambient Floating Bubbles / Particle System
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Render 3D Objects from Detections
    const debrisObjects = [];
    const raycastGroup = new THREE.Group();
    scene.add(raycastGroup);

    detections.forEach((det, idx) => {
      const cx = (det.box.xmin + det.box.xmax) / 2.0;
      const cy = (det.box.ymin + det.box.ymax) / 2.0;

      // Map normalized 0-1 coordinates to 3D world space
      const worldX = (cx - 0.5) * 12;
      const worldZ = (cy - 0.5) * 12;
      // Invert depth: deeper items closer to seafloor y = -2.0
      const worldY = 2.0 - (det.estimated_depth_m || 2.4);

      const colHex = CATEGORY_COLORS[det.category]?.hex || '#00e5ff';
      const threeColor = new THREE.Color(colHex);

      let mesh;

      // Category specific 3D Geometry
      if (det.category === 'Tire') {
        const geo = new THREE.TorusGeometry(0.7, 0.28, 16, 24);
        const mat = new THREE.MeshStandardMaterial({ color: 0x222831, roughness: 0.9 });
        mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = Math.PI / 2;
      } else if (det.category === 'Fishing Net' || det.category === 'Fishing Gear') {
        const geo = new THREE.OctahedronGeometry(0.9, 1);
        const mat = new THREE.MeshStandardMaterial({ color: threeColor, wireframe: true });
        mesh = new THREE.Mesh(geo, mat);
      } else if (det.category === 'Can') {
        const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 16);
        const mat = new THREE.MeshStandardMaterial({ color: threeColor, metalness: 0.8, roughness: 0.3 });
        mesh = new THREE.Mesh(geo, mat);
      } else if (det.category === 'Plastic Bag') {
        const geo = new THREE.DodecahedronGeometry(0.75, 1);
        const mat = new THREE.MeshStandardMaterial({ color: threeColor, transparent: true, opacity: 0.65 });
        mesh = new THREE.Mesh(geo, mat);
      } else {
        // Default Plastic Bottle / Container (Capsule)
        const geo = new THREE.CapsuleGeometry(0.35, 0.7, 8, 16);
        const mat = new THREE.MeshStandardMaterial({ color: threeColor, transparent: true, opacity: 0.8, roughness: 0.2 });
        mesh = new THREE.Mesh(geo, mat);
      }

      mesh.position.set(worldX, worldY, worldZ);
      mesh.userData = { id: det.id, det };
      mesh.castShadow = true;
      raycastGroup.add(mesh);

      // Add Vertical Depth Tether Line down to seafloor
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(worldX, worldY, worldZ),
        new THREE.Vector3(worldX, -2.48, worldZ)
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: threeColor,
        dashSize: 0.2,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.5
      });
      const tether = new THREE.Line(lineGeo, lineMat);
      scene.add(tether);

      // Add Seafloor shadow anchor disc
      const discGeo = new THREE.CircleGeometry(0.5, 16);
      const discMat = new THREE.MeshBasicMaterial({ color: threeColor, transparent: true, opacity: 0.3 });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(worldX, -2.47, worldZ);
      scene.add(disc);

      debrisObjects.push(mesh);
    });

    // 8. Mouse Orbit & Interaction Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 14, theta: Math.PI / 4, phi: Math.PI / 3 };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius = Math.max(5, Math.min(22, spherical.radius + e.deltaY * 0.015));
      updateCameraPos();
    };

    // Raycast on Click
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onClick = (e) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(raycastGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.id) {
          setSelectedDetId(hit.userData.id);
        }
      }
    };

    const dom = mountRef.current;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // 9. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle floating animation on debris
      debrisObjects.forEach((obj, i) => {
        obj.rotation.y += 0.01;
        obj.position.y += Math.sin(t * 1.5 + i) * 0.002;
      });

      // Slowly rise particle bubbles
      const pPos = particleGeo.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pPos[i] += 0.015;
        if (pPos[i] > 4.0) pPos[i] = -2.4;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom?.removeEventListener('mousedown', onMouseDown);
      dom?.removeEventListener('wheel', onWheel);
      dom?.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [detections, selectedDetId]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-cyan-500/30 space-y-4">
      {/* 3D Scene Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ocean-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              3D Underwater Spatial Scene Visualization
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive WebGL seafloor reconstruction with AI estimated depth positioning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
            ● AI ESTIMATED DEPTH
          </span>
          <button
            onClick={() => setSceneBuilt(false)}
            className="text-xs px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-bold transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>BUILD 3D SCENE</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport & Inspection Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Three.js Canvas Container (Left 8 cols) */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-ocean-950 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(0,10,25,0.9)] min-h-[440px]">
          
          <div ref={mountRef} className="w-full h-[440px] cursor-grab active:cursor-grabbing" />

          {/* On-screen HUD Controls overlay */}
          <div className="absolute top-3 left-3 bg-ocean-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-ocean-800 text-[11px] font-mono text-cyan-400 space-y-0.5 pointer-events-none">
            <p>ROTATE: Left Drag</p>
            <p>ZOOM: Scroll Wheel</p>
            <p>SELECT: Click Object</p>
          </div>

          {/* Depth Scale Marker HUD */}
          <div className="absolute bottom-3 left-3 bg-ocean-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-ocean-800 text-[10px] font-mono text-slate-300 space-y-0.5 pointer-events-none">
            <p className="text-cyan-400 font-bold">DEPTH SCALE</p>
            <p>0.0m — Water Surface</p>
            <p>2.5m — Thermocline Layer</p>
            <p>5.0m — Sandy Benthic Floor</p>
          </div>

          {/* Disclaimer Watermark */}
          <div className="absolute bottom-3 right-3 bg-ocean-950/80 text-[10px] text-slate-400 px-2.5 py-1 rounded border border-ocean-800 pointer-events-none">
            Relative 3D positioning derived from RGB optical depth estimation
          </div>
        </div>

        {/* 3D Object Inspector Card (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedDet ? (
            <div className="p-5 rounded-2xl bg-ocean-900/90 border border-cyan-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[selectedDet.category]?.hex || '#00e5ff' }}
                  />
                  <h4 className="text-sm font-bold text-white">
                    {selectedDet.label}
                  </h4>
                </div>
                <span className="font-mono text-xs text-cyan-400 font-bold">
                  {(selectedDet.confidence * 100).toFixed(1)}% Conf
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Relative Depth</span>
                  <span className="font-mono font-bold text-teal-300">
                    {selectedDet.estimated_depth_m} m
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Depth Confidence</span>
                  <span className="text-slate-200">{selectedDet.depth_confidence || 'Medium (Visual)'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Buoyancy State</span>
                  <span className="text-slate-300">{selectedDet.buoyancy}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Object Size</span>
                  <span className="font-bold text-white">{selectedDet.estimated_size || 'Medium'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Cleanup Priority</span>
                  <span className={`font-bold ${
                    selectedDet.category === 'Fishing Net' || selectedDet.category === 'Tire'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}>
                    {selectedDet.category === 'Fishing Net' || selectedDet.category === 'Tire' ? 'HIGH' : 'MEDIUM'}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Environmental Impact:</span>
                  <p className="text-[11px] text-slate-300 bg-ocean-950 p-2.5 rounded-xl border border-ocean-800 leading-relaxed">
                    {selectedDet.threat_level}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Click any 3D object in the viewport to inspect its spatial coordinates.
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Sensor Depth Compatibility:</span>
            <p className="text-[11px]">
              If ROV pressure transducers or stereo sonar sensors are connected, real depth replaces visual estimates automatically.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * ZEYARCH Section 02 — Real 3D Architectural Scene
 *
 * Loads the genuine 3D architectural GLB model (zeyarch-process-house.glb)
 * created in Blender 5.2 from the project's floor plan and elevations.
 *
 * Animates the 13 separate structural components across 4 scroll stages:
 * - 01 / PLAN: Top-down architectural view of 2D floor plan layout.
 * - 02 / DESIGN: Isometric transition; ground walls, partitions & columns extrude vertically.
 * - 03 / BUILD: Upper slab, bedroom walls, window frames & pitched roof assemble in place.
 * - 04 / COMPLETE: Full realistic materiality revealed (travertine, teak, bronze glass, terracotta).
 */
export function initArchitecturalScene(canvas, onReady) {
  // 1. Scene & Renderer Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f7f5f0'); // Warm ivory studio canvas

  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 500;

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 24, 0.05); // High top-down initial plan view

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // 2. Lighting Setup
  const ambientLight = new THREE.AmbientLight('#fff7ed', 1.0);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight('#fff5ea', 1.8);
  sunLight.position.set(16, 26, 14);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 5;
  sunLight.shadow.camera.far = 60;
  const d = 14;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight('#e6edf5', 0.5);
  fillLight.position.set(-14, 12, -10);
  scene.add(fillLight);

  // 3. Ground Plane & 2D Floor Plan Decal for Stage 01
  const groundGroup = new THREE.Group();
  scene.add(groundGroup);

  const textureLoader = new THREE.TextureLoader();
  const planTexture = textureLoader.load('/process-plan.png', () => {
    renderer.render(scene, camera);
  });
  planTexture.colorSpace = THREE.SRGBColorSpace;

  const planPlaneMat = new THREE.MeshBasicMaterial({
    map: planTexture,
    transparent: true,
    opacity: 0.95,
  });
  const planPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(12.8, 10.2),
    planPlaneMat
  );
  planPlane.rotation.x = -Math.PI / 2;
  planPlane.position.set(0, 0.02, 0);
  groundGroup.add(planPlane);

  // 4. Load Real 3D GLB Model
  const components = {};
  const originalTransforms = {};
  const originalMaterials = {};
  const clayMaterials = {};

  let isModelLoaded = false;
  let currentProgress = 0;

  const loader = new GLTFLoader();
  loader.load(
    '/models/zeyarch-process-house.glb',
    (gltf) => {
      const houseModel = gltf.scene;
      scene.add(houseModel);

      // Collect & catalog all 13 components
      houseModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const name = child.name;
          components[name] = child;
          originalTransforms[name] = {
            pos: child.position.clone(),
            scale: child.scale.clone(),
          };

          // Store original PBR material
          if (child.material) {
            originalMaterials[name] = child.material.clone();
            // Create corresponding clay/plaster material for construction stages
            const clayMat = child.material.clone();
            clayMat.roughness = 0.9;
            clayMat.metalness = 0.0;
            if (name === 'glass_panels') {
              clayMat.opacity = 0.25;
            } else {
              clayMat.color = new THREE.Color('#eae6dd');
            }
            clayMaterials[name] = clayMat;
          }
        }
      });

      isModelLoaded = true;
      console.log('[ZEYARCH 3D Scene] GLB loaded with components:', Object.keys(components));

      // Apply initial state
      update(currentProgress);
      if (onReady) onReady();
    },
    undefined,
    (err) => {
      console.error('[ZEYARCH 3D Scene] Error loading GLB model:', err);
    }
  );

  // 5. Scroll Transformation Engine
  function update(progress) {
    currentProgress = progress;
    const p = Math.max(0, Math.min(1, progress));

    // --- CAMERA INTERPOLATION ---
    // Stage 01 (0.00 - 0.25): Top-down 2D plan view
    // Stage 02 (0.25 - 0.52): Smooth transition to angled isometric view
    // Stage 03 (0.52 - 0.78): Three-quarter construction perspective
    // Stage 04 (0.78 - 1.00): Polished architectural eye-level perspective
    let camPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3();

    if (p < 0.25) {
      const t = p / 0.25;
      camPos.lerpVectors(
        new THREE.Vector3(0, 24, 0.05),
        new THREE.Vector3(5, 21, 8),
        t
      );
      lookTarget.lerpVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.6, 0), t);
    } else if (p < 0.52) {
      const t = (p - 0.25) / 0.27;
      camPos.lerpVectors(
        new THREE.Vector3(5, 21, 8),
        new THREE.Vector3(13.5, 14, 15),
        t
      );
      lookTarget.lerpVectors(new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(0, 1.8, 0), t);
    } else if (p < 0.78) {
      const t = (p - 0.52) / 0.26;
      camPos.lerpVectors(
        new THREE.Vector3(13.5, 14, 15),
        new THREE.Vector3(14.5, 11, 16),
        t
      );
      lookTarget.lerpVectors(new THREE.Vector3(0, 1.8, 0), new THREE.Vector3(0, 3.2, 0), t);
    } else {
      const t = (p - 0.78) / 0.22;
      camPos.lerpVectors(
        new THREE.Vector3(14.5, 11, 16),
        new THREE.Vector3(11.5, 7.5, 15.5),
        t
      );
      lookTarget.lerpVectors(new THREE.Vector3(0, 3.2, 0), new THREE.Vector3(0, 2.9, 0), t);
    }

    camera.position.copy(camPos);
    camera.lookAt(lookTarget);

    // --- 2D FLOOR PLAN DECAL VISIBILITY ---
    // Prominent in Stage 01, gently dims as 3D walls rise
    planPlaneMat.opacity = THREE.MathUtils.lerp(0.95, 0.15, Math.min(1, p * 2.5));

    if (!isModelLoaded) {
      renderer.render(scene, camera);
      return;
    }

    // --- 3D COMPONENT ANIMATION BASED ON SCROLL PROGRESS ---

    // 1. Foundation & Ground Slab
    // Always visible as the base plinth
    if (components.foundation) {
      components.foundation.visible = true;
    }
    if (components.ground_floor_slab) {
      components.ground_floor_slab.visible = true;
    }

    // 2. Ground Walls & Interior Partitions Extrusion (Stage 02: FORM, p = 0.16 -> 0.45)
    const wallExtrude = THREE.MathUtils.clamp((p - 0.16) / 0.26, 0.001, 1.0);
    const groundElements = ['ground_floor_walls', 'interior_partitions', 'columns', 'staircase'];
    groundElements.forEach((key) => {
      const obj = components[key];
      const orig = originalTransforms[key];
      if (obj && orig) {
        obj.visible = p > 0.12;
        obj.scale.y = orig.scale.y * wallExtrude;
        // Anchor vertical extrusion at bottom
        obj.position.y = orig.pos.y * wallExtrude;
      }
    });

    // 3. Upper Floor Slab & Balcony (Assembles between p = 0.40 -> 0.60)
    const ufs = components.upper_floor_slab;
    const origUfs = originalTransforms.upper_floor_slab;
    if (ufs && origUfs) {
      ufs.visible = p > 0.36;
      const t = THREE.MathUtils.clamp((p - 0.40) / 0.18, 0, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      ufs.position.y = THREE.MathUtils.lerp(origUfs.pos.y + 4.0, origUfs.pos.y, ease);
    }

    // 4. Upper Floor Walls (Extrude between p = 0.48 -> 0.68)
    const ufw = components.upper_floor_walls;
    const origUfw = originalTransforms.upper_floor_walls;
    if (ufw && origUfw) {
      ufw.visible = p > 0.44;
      const t = THREE.MathUtils.clamp((p - 0.48) / 0.18, 0.001, 1.0);
      ufw.scale.y = origUfw.scale.y * t;
      // Anchor extrusion on top of upper slab
      ufw.position.y = THREE.MathUtils.lerp(origUfw.pos.y - 1.2, origUfw.pos.y, t);
    }

    // 5. Windows & Glass Panels (Slide into place between p = 0.52 -> 0.70)
    ['window_frames', 'glass_panels'].forEach((key) => {
      const obj = components[key];
      const orig = originalTransforms[key];
      if (obj && orig) {
        obj.visible = p > 0.48;
        const t = THREE.MathUtils.clamp((p - 0.52) / 0.16, 0, 1);
        obj.scale.y = orig.scale.y * Math.max(0.001, t);
        obj.position.y = orig.pos.y;
      }
    });

    // 6. Roof Structure & Finishes (Lower into position between p = 0.62 -> 0.82)
    const roofElements = ['roof_structure', 'roof_finishes'];
    const roofT = THREE.MathUtils.clamp((p - 0.62) / 0.18, 0, 1);
    const roofEase = 1 - Math.pow(1 - roofT, 3);
    roofElements.forEach((key) => {
      const obj = components[key];
      const orig = originalTransforms[key];
      if (obj && orig) {
        obj.visible = p > 0.58;
        obj.position.y = THREE.MathUtils.lerp(orig.pos.y + 6.5, orig.pos.y, roofEase);
      }
    });

    // 7. Architectural Details (Gable louvers, verandah screen & circular moon-gate)
    const ad = components.architectural_details;
    const origAd = originalTransforms.architectural_details;
    if (ad && origAd) {
      ad.visible = p > 0.56;
      const t = THREE.MathUtils.clamp((p - 0.60) / 0.18, 0, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      ad.position.y = THREE.MathUtils.lerp(origAd.pos.y + 4.5, origAd.pos.y, ease);
    }

    // 8. Materiality & Shading Transition (Stage 04: COMPLETE, p = 0.76 -> 1.00)
    // Smoothly transition from neutral clay construction to authentic finishes
    const matProgress = THREE.MathUtils.clamp((p - 0.74) / 0.22, 0.0, 1.0);

    Object.keys(components).forEach((key) => {
      const mesh = components[key];
      const origMat = originalMaterials[key];
      const clayMat = clayMaterials[key];
      if (mesh && origMat && clayMat) {
        if (matProgress <= 0.01) {
          mesh.material = clayMat;
        } else if (matProgress >= 0.99) {
          mesh.material = origMat;
        } else {
          // Lerp material color
          if (mesh.material && origMat.color && clayMat.color) {
            mesh.material.color.lerpColors(clayMat.color, origMat.color, matProgress);
          }
        }
      }
    });

    // Sun & Ambient Lighting Accentuation
    sunLight.intensity = THREE.MathUtils.lerp(1.2, 1.85, matProgress);
    ambientLight.intensity = THREE.MathUtils.lerp(0.85, 1.15, matProgress);

    renderer.render(scene, camera);
  }

  // Initial render at progress 0
  update(0);

  function resize(w, h) {
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.render(scene, camera);
  }

  function dispose() {
    renderer.dispose();
    scene.clear();
  }

  return {
    scene,
    camera,
    renderer,
    components,
    update,
    resize,
    dispose,
  };
}

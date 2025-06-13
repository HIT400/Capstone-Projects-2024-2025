import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonToast,
  IonSpinner,
  IonChip,
  IonLabel,
  IonBadge,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  arrowBack,
  refreshOutline,
  expandOutline,
  contractOutline,
  informationCircleOutline,
} from "ionicons/icons";
import "./ARDev.css";

const ARDev: React.FC = () => {
  const history = useHistory();
  const [isARSupported, setIsARSupported] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [arMode, setARMode] = useState<
    "none" | "webxr-ar" | "webxr-vr" | "fallback"
  >("none");
  const [isPlaced, setIsPlaced] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modelScale, setModelScale] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedMolecule, setSelectedMolecule] = useState("H2O");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeRef = useRef<THREE.Group | null>(null);
  const controllerRef = useRef<OrbitControls | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const vrController1Ref: any = useRef(null);
  const vrController2Ref: any = useRef(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const materials = {
    oxygen: new THREE.MeshStandardMaterial({
      color: 0xff5555,
      metalness: 0.3,
      roughness: 0.4,
      envMapIntensity: 0.5,
    }),
    hydrogen: new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 0.2,
      roughness: 0.3,
      envMapIntensity: 0.3,
    }),
    carbon: new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.3,
      roughness: 0.4,
      envMapIntensity: 0.5,
    }),
    nitrogen: new THREE.MeshStandardMaterial({
      color: 0x5555ff,
      metalness: 0.3,
      roughness: 0.4,
      envMapIntensity: 0.5,
    }),
    bond: new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    }),
  };

  const checkXRSupport = async () => {
    if (!navigator.xr) {
      console.log("WebXR not available");
      return {
        arSupported: false,
        vrSupported: false,
        type: "none",
        message: "WebXR not supported by this browser",
      };
    }

    try {
      const arSupported = await navigator.xr.isSessionSupported("immersive-ar");
      const vrSupported = await navigator.xr.isSessionSupported("immersive-vr");
      console.log("AR Supported:", arSupported, "VR Supported:", vrSupported);
      if (arSupported) {
        return {
          arSupported: true,
          vrSupported,
          type: "webxr-ar",
          message: "WebXR AR supported",
        };
      } else if (vrSupported) {
        return {
          arSupported: false,
          vrSupported: true,
          type: "webxr-vr",
          message: "WebXR VR supported",
        };
      } else {
        return {
          arSupported: false,
          vrSupported: false,
          type: "fallback",
          message: "Using 3D fallback mode (no AR/VR support)",
        };
      }
    } catch (e) {
      console.error("XR support check failed:", e);
      return {
        arSupported: false,
        vrSupported: false,
        type: "fallback",
        message: "Using 3D fallback mode due to error: " + (e as Error).message,
      };
    }
  };

  useEffect(() => {
    async function initXR() {
      try {
        const xrSupport: any = await checkXRSupport();
        setIsARSupported(xrSupport.arSupported);
        setIsVRSupported(xrSupport.vrSupported);
        setARMode(xrSupport.type);
        setToastMessage(xrSupport.message);
        setShowToast(true);

        let renderer;
        if (xrSupport.type === "webxr-ar" || xrSupport.type === "webxr-vr") {
          renderer = initializeXRApp(xrSupport.type);
        } else if (xrSupport.type === "fallback") {
          renderer = initializeFallbackAR();
        }

        if (renderer && mountRef.current) {
          rendererRef.current = renderer;
          mountRef.current.appendChild(renderer.domElement);
        }
      } catch (error) {
        console.error("XR initialization error:", error);
        setToastMessage("Error initializing XR: " + (error as Error).message);
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    }

    initXR();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.setAnimationLoop(null);
        rendererRef.current.dispose();
      }
      const arButton = document.getElementById("ARButton");
      if (arButton && arButton.parentNode)
        arButton.parentNode.removeChild(arButton);
      const vrButton = document.getElementById("VRButton");
      if (vrButton && vrButton.parentNode)
        vrButton.parentNode.removeChild(vrButton);
    };
  }, []);

  function initializeXRApp(mode: "webxr-ar" | "webxr-vr") {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
      precision: "mediump",
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    if (mode === "webxr-ar") {
      const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"], // Ensure hit-test is supported
        optionalFeatures: ["dom-overlay", "light-estimation"], // Add light estimation for better visuals
        domOverlay: { root: document.body }, // Overlay UI on AR
      });
      styleXRButton(arButton);
      document.body.appendChild(arButton);

      // Debug AR button click
      arButton.addEventListener("click", () => {
        console.log("AR Button clicked, attempting to start session");
      });
    }

    if (mode === "webxr-vr" || isVRSupported) {
      const vrButton = VRButton.createButton(renderer);
      styleXRButton(vrButton);
      document.body.appendChild(vrButton);
    }

    createScene(renderer, mode);
    return renderer;
  }

  function styleXRButton(button: HTMLElement) {
    button.style.padding = "16px 24px";
    button.style.border = "none";
    button.style.borderRadius = "30px";
    button.style.background = "linear-gradient(45deg, #3880ff, #4c8dff)";
    button.style.color = "#ffffff";
    button.style.fontWeight = "bold";
    button.style.fontSize = "18px";
    button.style.opacity = "0.9";
    button.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    button.style.transition = "all 0.3s ease";
    button.style.position = "fixed";
    button.style.bottom = "30px";
    button.style.left = "50%";
    button.style.transform = "translateX(-50%)";
    button.style.zIndex = "1000"; // Ensure it’s above everything
  }

  function initializeFallbackAR() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: "mediump",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0.5, 3, 1);
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 0, 0);
    controls.update();
    controllerRef.current = controls;

    const molecule = createMolecule(selectedMolecule);
    molecule.visible = true;
    molecule.position.set(0, 0, 0);
    scene.add(molecule);
    moleculeRef.current = molecule;

    setIsPlaced(true);

    renderer.setAnimationLoop((timestamp) => {
      controls.update();
      if (molecule.visible) rotateMolecule(molecule, timestamp);
      renderer.render(scene, camera);
    });

    return renderer;
  }

  function createScene(
    renderer: THREE.WebGLRenderer,
    mode: "webxr-ar" | "webxr-vr"
  ) {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(0.5, 3, 1);
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.target.set(0, 1, 0);
    controls.update();
    controllerRef.current = controls;

    if (mode === "webxr-ar") {
      const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(
        -Math.PI / 2
      );
      const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x3880ff });
      const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      scene.add(reticle);
      reticleRef.current = reticle;

      const controller = renderer.xr.getController(0);
      controller.addEventListener("select", () => {
        if (!isPlaced && reticleRef.current) {
          console.log("Controller select event triggered");
          const molecule = moleculeRef.current!;
          molecule.position.setFromMatrixPosition(reticleRef.current.matrix);
          molecule.visible = true;
          setIsPlaced(true);
          setShowToast(false);
          reticleRef.current.visible = false;
        }
      });
      scene.add(controller);
    }

    if (mode === "webxr-vr") {
      const controller1 = renderer.xr.getController(0);
      controller1.addEventListener("selectstart", () => handleVRSelect());
      scene.add(controller1);
      vrController1Ref.current = controller1;

      const controller2 = renderer.xr.getController(1);
      controller2.addEventListener("selectstart", () => handleVRSelect());
      scene.add(controller2);
      vrController2Ref.current = controller2;

      const controllerMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00,
      });
      const controllerGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]);
      const line = new THREE.Line(controllerGeometry, controllerMaterial);
      line.scale.z = 5;
      controller1.add(line.clone());
      controller2.add(line.clone());
    }

    const molecule = createMolecule(selectedMolecule);
    molecule.visible = mode === "webxr-vr";
    molecule.position.set(0, 1.5, -1);
    scene.add(molecule);
    moleculeRef.current = molecule;

    renderer.xr.addEventListener("sessionstart", async () => {
      console.log("XR session started");
      setIsLoading(false);
      if (mode === "webxr-ar") {
        const session: any = renderer.xr.getSession();
        if (!session) {
          console.error("No AR session available");
          setToastMessage("AR session failed to start");
          setShowToast(true);
          return;
        }

        try {
          const viewerReferenceSpace: any = await session.requestReferenceSpace(
            "viewer"
          );
          const hitTestSource: any = await session.requestHitTestSource({
            space: viewerReferenceSpace,
          });
          console.log("Hit-test source initialized");

          setToastMessage("Looking for surfaces...");
          setShowToast(true);

          renderer.setAnimationLoop((timestamp, frame) => {
            if (!frame) {
              console.log("No frame available");
              return;
            }

            const hitTestResults = frame.getHitTestResults(hitTestSource);
            console.log("Hit-test results:", hitTestResults.length);

            if (hitTestResults.length > 0 && reticleRef.current) {
              const hit = hitTestResults[0];
              const referenceSpace: any = renderer.xr.getReferenceSpace();
              const hitPose = hit.getPose(referenceSpace);

              if (hitPose) {
                reticleRef.current.visible = true;
                reticleRef.current.matrix.fromArray(hitPose.transform.matrix);

                if (!isPlaced) {
                  setToastMessage("Tap to place molecule");
                  setShowToast(true);
                }
              }
            } else if (reticleRef.current) {
              reticleRef.current.visible = false;
            }

            if (molecule.visible) rotateMolecule(molecule, timestamp);
            renderer.render(scene, camera);
          });
        } catch (error) {
          console.error("AR session setup failed:", error);
          setToastMessage(
            "Failed to initialize AR: " + (error as Error).message
          );
          setShowToast(true);
        }
      } else if (mode === "webxr-vr") {
        renderer.setAnimationLoop((timestamp) => {
          if (molecule.visible) rotateMolecule(molecule, timestamp);
          renderer.render(scene, camera);
        });
      }
    });

    renderer.xr.addEventListener("sessionend", () => {
      console.log("XR session ended");
      setIsPlaced(false);
      if (moleculeRef.current) moleculeRef.current.visible = false;
    });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return renderer;
  }

  function createMolecule(type: string): THREE.Group {
    const moleculeGroup: any = new THREE.Group();
    switch (type) {
      case "H2O":
        const oxygen = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 32, 24),
          materials.oxygen
        );
        moleculeGroup.add(oxygen);
        const hydrogenGeometry = new THREE.SphereGeometry(0.2, 24, 16);
        const h1 = new THREE.Mesh(hydrogenGeometry, materials.hydrogen);
        const h2 = new THREE.Mesh(hydrogenGeometry, materials.hydrogen);
        h1.position.set(-0.35, 0.2, 0);
        h2.position.set(0.35, 0.2, 0);
        moleculeGroup.add(h1, h2);
        const bondGeometry = new THREE.CylinderGeometry(
          0.05,
          0.05,
          1,
          8,
          1,
          true
        );
        const bond1 = new THREE.Mesh(bondGeometry, materials.bond);
        const bond2 = new THREE.Mesh(bondGeometry, materials.bond);
        bond1.position.set(-0.175, 0.1, 0);
        bond1.scale.set(1, 0.45, 1);
        bond1.rotation.z = -0.4;
        bond2.position.set(0.175, 0.1, 0);
        bond2.scale.set(1, 0.45, 1);
        bond2.rotation.z = 0.4;
        moleculeGroup.add(bond1, bond2);
        moleculeGroup.add(
          createAtomLabel("O", 0xffffff).position.set(0, 0.5, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(-0.35, 0.5, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(0.35, 0.5, 0)
        );
        break;
      case "CO2":
        const carbon = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 32, 24),
          materials.carbon
        );
        moleculeGroup.add(carbon);
        const o1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 32, 24),
          materials.oxygen
        );
        const o2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 32, 24),
          materials.oxygen
        );
        o1.position.set(-0.8, 0, 0);
        o2.position.set(0.8, 0, 0);
        moleculeGroup.add(o1, o2);
        const bondGeometryCO2 = new THREE.CylinderGeometry(
          0.05,
          0.05,
          1,
          8,
          1,
          true
        );
        const bond1CO2 = new THREE.Mesh(bondGeometryCO2, materials.bond);
        const bond2CO2 = new THREE.Mesh(bondGeometryCO2, materials.bond);
        bond1CO2.position.set(-0.4, 0, 0);
        bond1CO2.scale.set(1, 0.8, 1);
        bond2CO2.position.set(0.4, 0, 0);
        bond2CO2.scale.set(1, 0.8, 1);
        moleculeGroup.add(bond1CO2, bond2CO2);
        moleculeGroup.add(
          createAtomLabel("C", 0xffffff).position.set(0, 0.5, 0)
        );
        moleculeGroup.add(
          createAtomLabel("O", 0xffffff).position.set(-0.8, 0.5, 0)
        );
        moleculeGroup.add(
          createAtomLabel("O", 0xffffff).position.set(0.8, 0.5, 0)
        );
        break;
      case "NH3":
        const nitrogen = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 32, 24),
          materials.nitrogen
        );
        moleculeGroup.add(nitrogen);
        const hGeometryNH3 = new THREE.SphereGeometry(0.2, 24, 16);
        const h1NH3 = new THREE.Mesh(hGeometryNH3, materials.hydrogen);
        const h2NH3 = new THREE.Mesh(hGeometryNH3, materials.hydrogen);
        const h3NH3 = new THREE.Mesh(hGeometryNH3, materials.hydrogen);
        h1NH3.position.set(-0.35, 0.2, 0);
        h2NH3.position.set(0.35, 0.2, 0);
        h3NH3.position.set(0, -0.2, 0.35);
        moleculeGroup.add(h1NH3, h2NH3, h3NH3);
        const bondGeometryNH3 = new THREE.CylinderGeometry(
          0.05,
          0.05,
          1,
          8,
          1,
          true
        );
        const bond1NH3 = new THREE.Mesh(bondGeometryNH3, materials.bond);
        const bond2NH3 = new THREE.Mesh(bondGeometryNH3, materials.bond);
        const bond3NH3 = new THREE.Mesh(bondGeometryNH3, materials.bond);
        bond1NH3.position.set(-0.175, 0.1, 0);
        bond1NH3.scale.set(1, 0.45, 1);
        bond1NH3.rotation.z = -0.4;
        bond2NH3.position.set(0.175, 0.1, 0);
        bond2NH3.scale.set(1, 0.45, 1);
        bond2NH3.rotation.z = 0.4;
        bond3NH3.position.set(0, -0.1, 0.175);
        bond3NH3.scale.set(1, 0.45, 1);
        bond3NH3.rotation.x = -0.4;
        moleculeGroup.add(bond1NH3, bond2NH3, bond3NH3);
        moleculeGroup.add(
          createAtomLabel("N", 0xffffff).position.set(0, 0.5, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(-0.35, 0.5, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(0.35, 0.5, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(0, -0.2, 0.55)
        );
        break;
      case "CH4":
        const carbonCH4 = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 32, 24),
          materials.carbon
        );
        moleculeGroup.add(carbonCH4);
        const hGeometryCH4 = new THREE.SphereGeometry(0.2, 24, 16);
        const h1CH4 = new THREE.Mesh(hGeometryCH4, materials.hydrogen);
        const h2CH4 = new THREE.Mesh(hGeometryCH4, materials.hydrogen);
        const h3CH4 = new THREE.Mesh(hGeometryCH4, materials.hydrogen);
        const h4CH4 = new THREE.Mesh(hGeometryCH4, materials.hydrogen);
        h1CH4.position.set(-0.35, 0.35, 0);
        h2CH4.position.set(0.35, 0.35, 0);
        h3CH4.position.set(0, -0.35, 0.35);
        h4CH4.position.set(0, -0.35, -0.35);
        moleculeGroup.add(h1CH4, h2CH4, h3CH4, h4CH4);
        const bondGeometryCH4 = new THREE.CylinderGeometry(
          0.05,
          0.05,
          1,
          8,
          1,
          true
        );
        const bond1CH4 = new THREE.Mesh(bondGeometryCH4, materials.bond);
        const bond2CH4 = new THREE.Mesh(bondGeometryCH4, materials.bond);
        const bond3CH4 = new THREE.Mesh(bondGeometryCH4, materials.bond);
        const bond4CH4 = new THREE.Mesh(bondGeometryCH4, materials.bond);
        bond1CH4.position.set(-0.175, 0.175, 0);
        bond1CH4.scale.set(1, 0.5, 1);
        bond1CH4.rotation.z = -0.785;
        bond2CH4.position.set(0.175, 0.175, 0);
        bond2CH4.scale.set(1, 0.5, 1);
        bond2CH4.rotation.z = 0.785;
        bond3CH4.position.set(0, -0.175, 0.175);
        bond3CH4.scale.set(1, 0.5, 1);
        bond3CH4.rotation.x = -0.785;
        bond4CH4.position.set(0, -0.175, -0.175);
        bond4CH4.scale.set(1, 0.5, 1);
        bond4CH4.rotation.x = 0.785;
        moleculeGroup.add(bond1CH4, bond2CH4, bond3CH4, bond4CH4);
        moleculeGroup.add(
          createAtomLabel("C", 0xffffff).position.set(0, 0.6, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(-0.35, 0.55, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(0.35, 0.55, 0)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(0, -0.55, 0.35)
        );
        moleculeGroup.add(
          createAtomLabel("H", 0xffffff).position.set(0, -0.55, -0.35)
        );
        break;
    }
    return moleculeGroup;
  }

  function createAtomLabel(text: any, color: any): THREE.Sprite {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = 64;
    canvas.height = 32;

    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "24px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.3, 0.15, 1);

    return sprite;
  }

  function rotateMolecule(molecule: THREE.Group, timestamp: number) {
    if (timestamp) {
      const period = 5000;
      const angle = ((timestamp % period) / period) * Math.PI * 2;
      molecule.rotation.y = angle;
      molecule.rotation.x = Math.sin(angle) * 0.08;
      molecule.rotation.z = Math.cos(angle) * 0.08;
    }
  }

  const handleBackClick = () => history.goBack();

  const handleReset = () => {
    if (moleculeRef.current) moleculeRef.current.visible = false;
    setIsPlaced(false);

    if (arMode === "webxr-ar") {
      setToastMessage("Find a surface to place the molecule");
      setShowToast(true);
      if (reticleRef.current) reticleRef.current.visible = true;
    } else if (arMode === "webxr-vr" || arMode === "fallback") {
      if (moleculeRef.current && sceneRef.current) {
        sceneRef.current.remove(moleculeRef.current);
        const newMolecule = createMolecule(selectedMolecule);
        newMolecule.visible = true;
        newMolecule.position.set(
          0,
          arMode === "webxr-vr" ? 1.5 : 0,
          arMode === "webxr-vr" ? -1 : 0
        );
        newMolecule.scale.set(1, 1, 1);
        sceneRef.current.add(newMolecule);
        moleculeRef.current = newMolecule;
        setModelScale(1);
        setIsPlaced(true);
      }
    }
  };

  const handleScaleChange = (factor: number) => {
    if (moleculeRef.current && isPlaced) {
      const newScale = modelScale * factor;
      if (newScale >= 0.2 && newScale <= 5) {
        moleculeRef.current.scale.set(newScale, newScale, newScale);
        setModelScale(newScale);
        setToastMessage(`Scale: ${Math.round(newScale * 100)}%`);
        setShowToast(true);
      }
    }
  };

  const toggleInfo = () => setShowInfo(!showInfo);

  const handleMoleculeChange = (newMolecule: string) => {
    setSelectedMolecule(newMolecule);
    if (moleculeRef.current && sceneRef.current) {
      const currentPosition = moleculeRef.current.position.clone();
      const currentScale = moleculeRef.current.scale.clone();
      sceneRef.current.remove(moleculeRef.current);
      const newMoleculeObj = createMolecule(newMolecule);
      newMoleculeObj.visible = isPlaced;
      newMoleculeObj.position.copy(currentPosition);
      newMoleculeObj.scale.copy(currentScale);
      sceneRef.current.add(newMoleculeObj);
      moleculeRef.current = newMoleculeObj;
      setToastMessage(`Switched to ${getMoleculeInfo().name}`);
      setShowToast(true);
    }
  };

  const handleVRSelect = () => {
    if (arMode === "webxr-vr" && isPlaced) {
      const molecules = ["H2O", "CO2", "NH3", "CH4"];
      const currentIndex = molecules.indexOf(selectedMolecule);
      const nextIndex = (currentIndex + 1) % molecules.length;
      handleMoleculeChange(molecules[nextIndex]);
    }
  };

  const getMoleculeInfo = () => {
    switch (selectedMolecule) {
      case "H2O":
        return {
          name: "Water (H₂O)",
          angle: "104.5°",
          description: "Bent shape due to oxygen lone pairs",
        };
      case "CO2":
        return {
          name: "Carbon Dioxide (CO₂)",
          angle: "180°",
          description: "Linear molecule with double bonds",
        };
      case "NH3":
        return {
          name: "Ammonia (NH₃)",
          angle: "107°",
          description: "Trigonal pyramidal shape",
        };
      case "CH4":
        return {
          name: "Methane (CH₄)",
          angle: "109.5°",
          description: "Tetrahedral shape",
        };
      default:
        return { name: "", angle: "", description: "" };
    }
  };

  return (
    <IonPage className="ar-page">
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>AR</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ar-content">
        <div
          ref={mountRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        {isLoading && (
          <div className="loading-container">
            <IonSpinner name="circles" />
            <p>
              Initializing{" "}
              {arMode === "fallback"
                ? "3D View"
                : arMode === "webxr-vr"
                ? "VR"
                : "AR"}
              ...
            </p>
          </div>
        )}

        {!isARSupported && !isVRSupported && !isLoading && (
          <div className="no-ar-support">
            <h2>XR Not Available</h2>
            <p>{toastMessage}</p>
            <IonButton onClick={handleBackClick}>Go Back</IonButton>
          </div>
        )}

        {arMode !== "webxr-vr" && (
          <IonFab vertical="top" horizontal="start" slot="fixed">
            <IonSelect
              value={selectedMolecule}
              onIonChange={(e) => handleMoleculeChange(e.detail.value!)}
              interface="popover"
              placeholder="Select Molecule"
            >
              <IonSelectOption value="H2O">H₂O (Water)</IonSelectOption>
              <IonSelectOption value="CO2">
                CO₂ (Carbon Dioxide)
              </IonSelectOption>
              <IonSelectOption value="NH3">NH₃ (Ammonia)</IonSelectOption>
              <IonSelectOption value="CH4">CH₄ (Methane)</IonSelectOption>
            </IonSelect>
          </IonFab>
        )}

        {isPlaced && arMode !== "webxr-vr" && (
          <>
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton
                color="light"
                onClick={() => handleScaleChange(1.2)}
              >
                <IonIcon icon={expandOutline} />
              </IonFabButton>
            </IonFab>

            <IonFab vertical="bottom" horizontal="start" slot="fixed">
              <IonFabButton
                color="light"
                onClick={() => handleScaleChange(0.8)}
              >
                <IonIcon icon={contractOutline} />
              </IonFabButton>
            </IonFab>

            <IonFab vertical="center" horizontal="end" slot="fixed">
              <IonFabButton color="medium" onClick={handleReset}>
                <IonIcon icon={refreshOutline} />
              </IonFabButton>
            </IonFab>
          </>
        )}

        {showInfo && arMode !== "webxr-vr" && (
          <div className="info-panel">
            <h3>{getMoleculeInfo().name}</h3>
            <div className="atom-info">
              {selectedMolecule === "H2O" && (
                <>
                  <IonChip color="danger">
                    <IonLabel>Oxygen (O)</IonLabel>
                    <IonBadge color="light">8p⁺</IonBadge>
                  </IonChip>
                  <IonChip color="primary">
                    <IonLabel>Hydrogen (H)</IonLabel>
                    <IonBadge color="light">1p⁺</IonBadge>
                  </IonChip>
                </>
              )}
              {selectedMolecule === "CO2" && (
                <>
                  <IonChip color="dark">
                    <IonLabel>Carbon (C)</IonLabel>
                    <IonBadge color="light">6p⁺</IonBadge>
                  </IonChip>
                  <IonChip color="danger">
                    <IonLabel>Oxygen (O)</IonLabel>
                    <IonBadge color="light">8p⁺</IonBadge>
                  </IonChip>
                </>
              )}
              {selectedMolecule === "NH3" && (
                <>
                  <IonChip color="tertiary">
                    <IonLabel>Nitrogen (N)</IonLabel>
                    <IonBadge color="light">7p⁺</IonBadge>
                  </IonChip>
                  <IonChip color="primary">
                    <IonLabel>Hydrogen (H)</IonLabel>
                    <IonBadge color="light">1p⁺</IonBadge>
                  </IonChip>
                </>
              )}
              {selectedMolecule === "CH4" && (
                <>
                  <IonChip color="dark">
                    <IonLabel>Carbon (C)</IonLabel>
                    <IonBadge color="light">6p⁺</IonBadge>
                  </IonChip>
                  <IonChip color="primary">
                    <IonLabel>Hydrogen (H)</IonLabel>
                    <IonBadge color="light">1p⁺</IonBadge>
                  </IonChip>
                </>
              )}
            </div>
            <p>Bond angle: {getMoleculeInfo().angle}</p>
            <p>{getMoleculeInfo().description}</p>
          </div>
        )}

        {arMode === "webxr-vr" && isPlaced && (
          <div className="vr-instructions">
            <p>Use VR controller trigger to cycle through molecules</p>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default ARDev;

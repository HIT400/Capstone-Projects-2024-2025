import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonBadge,
  IonText
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import "./AtomicModel.css";
import { arrowBack, informationCircle, colorPalette, cube, eye, eyeOff } from "ionicons/icons";

const AtomicModel = () => {
  // Retrieve data from localStorage
  const elementName = localStorage.getItem("elementName") || "Unknown Element";
  const protons = localStorage.getItem("protons") || "0";
  const electrons = localStorage.getItem("electrons") || "0";
  const neutrons = localStorage.getItem("neutrons") || "0";
  const atomicWeight = localStorage.getItem("atomicWeight") || "0";

  // Convert protons and electrons to numbers
  const protonsCount = parseInt(protons, 10);
  const electronsCount = parseInt(electrons, 10);
  const neutronsCount = parseInt(neutrons, 10) || protonsCount; // Fallback to protons if not specified

  const mountRef = useRef<HTMLDivElement>(null);
  const xrButtonRef = useRef<any>(null);
  const vrButtonRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.WebXRCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const electronsArrayRef = useRef<any[]>([]);
  const nucleusRef = useRef<THREE.Group | null>(null);
  
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Color themes for the atomic model
  const themes = {
    default: {
      background: 0x000000,
      nucleus: 0xff5733,
      proton: 0xff3333,
      neutron: 0x3366ff,
      electron: 0x00aaff,
      orbit: 0x555555
    },
    neon: {
      background: 0x000033,
      nucleus: 0xff00ff,
      proton: 0xff00aa,
      neutron: 0x00ffaa,
      electron: 0x00ffff,
      orbit: 0x880088
    },
    classic: {
      background: 0x222222,
      nucleus: 0xcc0000,
      proton: 0xdd0000,
      neutron: 0x0000dd,
      electron: 0xffaa00,
      orbit: 0x666666
    }
  };

  // Check for XR support
  useEffect(() => {
    const initializeXR = async () => {
      if (navigator.xr) {
        setIsXRSupported(true);

        // Check for AR support
        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!arSupported) {
          console.log("WebXR AR not supported.");
        }

        // Check for VR support
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          setIsVRSupported(supported);
          if (supported) {
            console.log("WebXR VR supported.");
          } else {
            console.log("WebXR VR not supported.");
          }
        });
      } else {
        console.log("WebXR not available.");
      }
    };

    initializeXR();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const theme = themes[currentTheme as keyof typeof themes];
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.background);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Create nucleus group
    const nucleusGroup = new THREE.Group();
    nucleusRef.current = nucleusGroup;
    scene.add(nucleusGroup);

    // Create protons
    const protonGeometry = new THREE.SphereGeometry(0.03, 32, 32);
    const protonMaterial = new THREE.MeshStandardMaterial({ 
      color: theme.proton,
      roughness: 0.4,
      metalness: 0.3
    });
    
    // Create neutrons
    const neutronGeometry = new THREE.SphereGeometry(0.03, 32, 32);
    const neutronMaterial = new THREE.MeshStandardMaterial({ 
      color: theme.neutron,
      roughness: 0.5,
      metalness: 0.2
    });
    
    // Arrange protons and neutrons in a cluster formation
    const nucleonCount = protonsCount + neutronsCount;
    const radius = 0.05;
    
    for (let i = 0; i < nucleonCount; i++) {
      const isProton = i < protonsCount;
      const nucleon = new THREE.Mesh(
        isProton ? protonGeometry : neutronGeometry,
        isProton ? protonMaterial : neutronMaterial
      );
      
      // Position in a sphere-like arrangement
      const phi = Math.acos(-1 + (2 * i) / nucleonCount);
      const theta = Math.sqrt(nucleonCount * Math.PI) * phi;
      
      nucleon.position.x = radius * Math.cos(theta) * Math.sin(phi);
      nucleon.position.y = radius * Math.sin(theta) * Math.sin(phi);
      nucleon.position.z = radius * Math.cos(phi);
      
      nucleusGroup.add(nucleon);
    }

    // Function to create orbit paths with glow effect
    const createOrbit = (radius: number) => {
      // Create orbit line
      const curve = new THREE.EllipseCurve(0, 0, radius, radius);
      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: theme.orbit,
        transparent: true,
        opacity: 0.6
      });
      const orbit = new THREE.LineLoop(geometry, material);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
      
      // Add a slight glow effect
      const glowGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const glowMaterial = new THREE.LineBasicMaterial({ 
        color: theme.orbit,
        transparent: true,
        opacity: 0.3,
        linewidth: 2
      });
      const glowOrbit = new THREE.LineLoop(glowGeometry, glowMaterial);
      glowOrbit.rotation.x = Math.PI / 2;
      glowOrbit.scale.set(1.01, 1.01, 1.01);
      scene.add(glowOrbit);
      
      return orbit;
    };

    // Calculate electron shells (using simplified Bohr model)
    const shellConfig = [2, 8, 18, 32, 50]; // Electron limits per shell
    let remainingElectrons = electronsCount;
    const electronShells: number[] = [];

    for (let i = 0; i < shellConfig.length && remainingElectrons > 0; i++) {
      const electronsInShell = Math.min(remainingElectrons, shellConfig[i]);
      electronShells.push(electronsInShell);
      remainingElectrons -= electronsInShell;
    }

    // Create electrons in shells
    const electronGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const electronMaterial = new THREE.MeshStandardMaterial({
      color: theme.electron,
      emissive: theme.electron,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.8
    });
    
    const electronsArray: any[] = [];
    electronsArrayRef.current = electronsArray;

    electronShells.forEach((count, shellIndex) => {
      const radius = (shellIndex + 1) * 0.2;
      createOrbit(radius);

      for (let i = 0; i < count; i++) {
        const angle = (i * (2 * Math.PI)) / count;
        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        
        // Calculate initial position
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        electron.position.set(x, 0, z);
        
        // Add a slight glow effect to electrons
        const electronGlow = new THREE.PointLight(theme.electron, 0.3, 0.5);
        electron.add(electronGlow);
        
        scene.add(electron);
        electronsArray.push({ 
          mesh: electron, 
          angle, 
          radius, 
          speed: 0.02 + (Math.random() * 0.01) - 0.005, // Slightly varying speeds
          shellIndex 
        });
      }
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add a point light in the center to illuminate the nucleus
    const nucleusLight = new THREE.PointLight(theme.nucleus, 1, 2);
    nucleusLight.position.set(0, 0, 0);
    scene.add(nucleusLight);

    camera.position.z = 1;

    // Animation loop
    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      requestAnimationFrame(animate);
      time += 0.01;
      
      // Animate electrons
      electronsArrayRef.current.forEach(({ mesh, angle, radius, speed, shellIndex }: any) => {
        // Different shells move at different speeds (inner shells move faster)
        const adjustedSpeed = speed / (shellIndex + 1);
        
        // Move electrons
        mesh.position.set(
          Math.cos(time * adjustedSpeed * 5 + angle) * radius,
          0,
          Math.sin(time * adjustedSpeed * 5 + angle) * radius
        );
      });
      
      // Rotate nucleus slowly
      if (nucleusRef.current) {
        nucleusRef.current.rotation.x += 0.002;
        nucleusRef.current.rotation.y += 0.003;
      }

      if (!isPresenting && controlsRef.current) {
        controlsRef.current.update();
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current && rendererRef.current.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      sceneRef.current?.clear();
    };
  }, [protonsCount, electronsCount, neutronsCount, isPresenting, currentTheme, isAutoRotate]);

  const enterXR = async () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !xrButtonRef.current) return;

    setIsPresenting(true);

    const session : any = await navigator.xr?.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      // optionalFeatures: ['dom-overlay'],
      // domOverlay: { root: document.body },
    });

    rendererRef.current.xr.setSession(session);
    cameraRef.current.position.set(0, 0, 0); // Reset camera position in XR

    const reticleGeometry = new THREE.RingGeometry(0.015, 0.02, 32).rotateX(- Math.PI / 2);
    const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    sceneRef.current.add(reticle);

    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    const hitTestSourceRequested = false;
    let hitTestSource: XRHitTestSource | null = null;

    session.addEventListener('selectstart', () => {
      reticle.visible = false;
      if (sceneRef.current && reticle.matrix) {
        const atomicModel = sceneRef.current.children.find(obj => obj.type === 'Mesh' && obj !== reticle);
        if (atomicModel) {
          atomicModel.position.setFromMatrixPosition(reticle.matrix);
        }
      }
    });

    session.addEventListener('end', () => {
      setIsPresenting(false);
      if (hitTestSource) {
        session.endHitTestSource(hitTestSource);
        hitTestSource = null;
      }
      sceneRef.current?.remove(reticle);
    });

    const onXRFrame = (time: number, frame: XRFrame) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      session.requestAnimationFrame(onXRFrame);

      const referenceSpace : any = rendererRef.current.xr.getReferenceSpace();
      const viewerPose = frame.getViewerPose(referenceSpace);

      if (viewerPose) {
        cameraRef.current.position.set(0, 0, 0);
        cameraRef.current.rotation.set(0, 0, 0);
        cameraRef.current.updateMatrixWorld(true);

        tempMatrix.identity().extractRotation(cameraRef.current.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(cameraRef.current.matrixWorld);
        raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

        if (!hitTestSourceRequested && session) {
          session.requestHitTestSource({ space: referenceSpace }).then((source : any) => {
            hitTestSource = source;
          });
        }

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length) {
            const hit = hitTestResults[0];
            if (reticle) {
              reticle.visible = true;
              reticle.matrix.fromArray(hit.getPose(referenceSpace)?.transform.matrix || new Float32Array(16));
            }
          } else if (reticle) {
            reticle.visible = false;
          }
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    session.requestAnimationFrame(onXRFrame);
  };

  const enterVR = async () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !vrButtonRef.current) return;

    setIsPresenting(true);

    const session : any = await navigator.xr?.requestSession('immersive-vr');

    rendererRef.current.xr.setSession(session);
    cameraRef.current.position.set(0, 0, 0); // Reset camera position in VR

    session.addEventListener('end', () => {
      setIsPresenting(false);
    });

    const onXRFrame = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      session.requestAnimationFrame(onXRFrame);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    session.requestAnimationFrame(onXRFrame);
  };

  // Navigate back to the previous page
  const handleBackClick = () => {
    window.history.back();
  };

  // Toggle info panel visibility
  const toggleInfoVisibility = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  // Change theme
  const changeTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themeKeys[nextIndex]);
  };

  // Toggle auto-rotation
  const toggleAutoRotate = () => {
    setIsAutoRotate(!isAutoRotate);
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isAutoRotate;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{elementName} Atomic Model</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleInfoVisibility}>
              <IonIcon icon={informationCircle} />
            </IonButton>
            <IonButton onClick={changeTheme}>
              <IonIcon icon={colorPalette} />
            </IonButton>
            <IonButton onClick={toggleAutoRotate}>
              <IonIcon icon={isAutoRotate ? eye : eyeOff} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="no-scroll">
        <div ref={mountRef} className="three-container" />
        
        {/* XR Buttons */}
        {isXRSupported && !isPresenting && (
          <div className="xr-buttons" style={{ paddingTop: '40px' }}>
            {isVRSupported && (
              <IonButton 
                color="tertiary" 
                shape="round" 
                onClick={enterVR} 
                ref={vrButtonRef}
                className="xr-button"
              >
                <IonIcon icon={cube} slot="start" />
                Virtual Reality
              </IonButton>
            )}
            <IonButton 
              color="secondary" 
              shape="round" 
              onClick={enterXR} 
              ref={xrButtonRef}
              className="xr-button"
            >
              <IonIcon icon={cube} slot="start" />
              Augmented Reality
            </IonButton>
          </div>
        )}
        
        {/* Element Information Card */}
        {isInfoVisible && (
          <IonCard className="element-info-card">
            <IonCardHeader>
              <IonCardTitle>{elementName}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="element-stats">
                <div className="stat-item">
                  <IonBadge color="danger">Protons</IonBadge>
                  <IonText>{protonsCount}</IonText>
                </div>
                <div className="stat-item">
                  <IonBadge color="primary">Electrons</IonBadge>
                  <IonText>{electronsCount}</IonText>
                </div>
                <div className="stat-item">
                  <IonBadge color="secondary">Neutrons</IonBadge>
                  <IonText>{neutronsCount}</IonText>
                </div>
                <div className="stat-item">
                  <IonBadge color="success">Atomic Weight</IonBadge>
                  <IonText>{atomicWeight}</IonText>
                </div>
              </div>
              
              <div className="element-shells">
                <h4>Electron Configuration</h4>
                <div className="shell-display">
                  {calculateElectronShells(electronsCount).map((electrons, index) => (
                    <IonChip key={index} color="primary" className="shell-chip">
                      Shell {index + 1}: {electrons} electrons
                    </IonChip>
                  ))}
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

// Helper function to calculate electron shells
function calculateElectronShells(electronCount: number): number[] {
  const shellConfig = [2, 8, 18, 32, 50]; // Electron limits per shell
  let remainingElectrons = electronCount;
  const electronShells: number[] = [];

  for (let i = 0; i < shellConfig.length && remainingElectrons > 0; i++) {
    const electronsInShell = Math.min(remainingElectrons, shellConfig[i]);
    electronShells.push(electronsInShell);
    remainingElectrons -= electronsInShell;
  }

  return electronShells;
}

export default AtomicModel;
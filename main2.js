import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';

export default class Scene {
    constructor() {
        this.scene = this.getScene();
        this.camera = this.getCamera();
        this.renderer = this.getRenderer();
        this.controls = this.createOrbitControls(this.camera, this.renderer);
        this.lights = [this.getDirectionalLight(), this.getAmbientLight()];

        this.setup();
        this.loadEnvMap();
    }

    getScene() {
        return new THREE.Scene();
    }

    getCamera() {
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(2, 1.86, 2);
        return camera;
    }

    getRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
    }

    createOrbitControls(camera, renderer) {
        let controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;
        return controls;
    }

    getDirectionalLight() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        return directionalLight;
    }

    getAmbientLight() {
        return new THREE.AmbientLight(0x404040);
    }

    loadEnvMap() {
        let envMap;
        const loader = new RGBELoader();
        loader.setDataType(THREE.UnsignedByteType);
        loader.load(
            'starmap_2020_4k.hdr',
            (texture) => {
                const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
                pmremGenerator.compileEquirectangularShader();
                envMap = pmremGenerator.fromEquirectangular(texture).texture;
                this.renderer.setClearColor(new THREE.Color().setRGB(0, 0, 0), 0);
                this.scene.background = envMap;
                texture.dispose();
                pmremGenerator.dispose();
            },
            undefined,
            (err) => {
                console.error('Error loading HDR texture', err);
            }
        );
    }

    addGLTF(gltfFileName) {
        const loader = new GLTFLoader();
        loader.load(
            './assets/3D/' + gltfFileName,
            (gltf) => {
                // Adjust the position, rotation, and scale of the loaded model as needed
                gltf.scene.position.set(0, 0, 0);
                gltf.scene.rotation.set(0, 0, 0);
                gltf.scene.scale.set(1, 1, 1);
    
                this.scene.add(gltf.scene);
            },
            undefined,
            (error) => {
                console.error('Error loading GLTF file:', error);
            }
        );
    }

    removeGLTF() {
        // Iterate over all objects in the scene
        this.scene.traverse(object => {
            // Check if the object is an instance of a GLTF object
            if (object.isGLTF) {
                // Remove the object from the scene
                this.scene.remove(object);
            }
        });
    }

    setup() {
        this.lights.forEach(light => {
            this.scene.add(light);
        });
        window.addEventListener('resize', () => this.resize());
    }

    addObject(object) {
        this.scene.add(object);
    }

    removeObject(object) {
        this.scene.remove(object);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.render();
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

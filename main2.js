import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';

export default class Scene {
    constructor(gltfFileName) {
        this.scene = this.getScene();
        this.camera = this.getCamera();
        this.renderer = this.getRenderer();
        this.controls = this.createOrbitControls(this.camera, this.renderer);
        this.lights = [this.getDirectionalLight(), this.getAmbientLight()];

        this.setup();
        this.loadEnvMap();
        this.loadedGLTFs(gltfFileName);
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
        const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(10, 1, 1);
        return directionalLight;
    }

    getAmbientLight() {
        return new THREE.AmbientLight(0xffffff, 100);
    }

    loadEnvMap() {
        console.log('Loading env map...');
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

    loadedGLTFs(gltfFileName) {
        const loader = new GLTFLoader();
        loader.load(
            './assets/3D/' + "earth.gltf",
            (gltf) => {
                this.scene.add(gltf.scene);
            },
            undefined,
            (error) => {
                console.error('Error loading GLTF model', error);
            }
        );
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

    removeAllObjects() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
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

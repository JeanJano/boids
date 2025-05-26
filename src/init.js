import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { moveTowardsCenterOfMass, rotateBoid, avoidBoids, speed, updatePosition, checkBounds } from './boids.js'
import { Sky } from 'three/addons/objects/Sky.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)

// renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

window.addEventListener('resize', resize_screen)
window.addEventListener('dblclick', fullscreen)

function resize_screen() {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function fullscreen() {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        }
        else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
}

/**
 * Object
 */

function initBoids() {
    const boidCount = 500
    const boids = new THREE.Group()
    const ambientLight = new THREE.AmbientLight(0xffffff, 2)
    scene.add(ambientLight)

    const loader = new GLTFLoader()
    loader.load('paper_plane.glb', function (gltf) {
        console.log(gltf)
        for (let i = 0; i < boidCount; i++) {
            const boid = gltf.scene.clone()
            boid.position.x = Math.random() * 10 - 5
            boid.position.y = Math.random() * 10 - 5
            boid.position.z = Math.random() * 10 - 5
            boid.direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            boid.scale.setScalar(0.4)
            boids.add(boid)
        }
    })

    for (let i = 0; i < boidCount; i++) {
        const geometry = new THREE.ConeGeometry(0.08, 0.4, 32)
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.x = Math.random() * 10 - 5
        mesh.position.y = Math.random() * 10 - 5
        mesh.position.z = Math.random() * 10 - 5
        // add a direction vector to the boid
        mesh.direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)

        boids.add(mesh)
    }

    scene.add(boids)
    return (boids)
}

function init_predator() {
    const predatorGeometry = new THREE.ConeGeometry(1, 1.8, 32);
    const predatorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const predator = new THREE.Mesh(predatorGeometry, predatorMaterial);
    predator.position.x = Math.random() * 10 - 5;
    predator.position.y = Math.random() * 10 - 5;
    predator.position.z = Math.random() * 10 - 5;
    predator.direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

    scene.add(predator);
    return (predator);
}

function init_bounds() {
    const geometry = new THREE.BoxGeometry(50, 50, 50)
    const material = new THREE.MeshBasicMaterial({ color: 0x403002, side: THREE.BackSide, visible: false})
    const bounds = new THREE.Mesh(geometry, material)
    scene.add(bounds)
    return (bounds)
}

function initSky() {
    const sky = new Sky()
    sky.scale.setScalar(100, 100, 100)
    scene.add(sky)
    sky.material.uniforms['turbidity'].value = 10
    sky.material.uniforms['rayleigh'].value = 3
    sky.material.uniforms['mieCoefficient'].value = 0.1
    sky.material.uniforms['mieDirectionalG'].value = 0.95
    sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)
}

function init() {
    
    camera.position.z = 60
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const boids = initBoids()
    const predator = init_predator()
    const bounds = init_bounds()

    initSky();

    const tick = () => {
        controls.update()

        renderer.render(scene, camera)

        // move all boids
        boids.children.forEach(boid => {
            rotateBoid(boid)
            avoidBoids(boid, boids, predator, bounds)
            moveTowardsCenterOfMass(boid, boids)
            speed(boid)
            updatePosition(boid)
            checkBounds(boid, bounds)
        })

        // move predator
        rotateBoid(predator)
        speed(predator)
        updatePosition(predator)
        checkBounds(predator, bounds)
        
        window.requestAnimationFrame(tick)
    }
    tick()
}

init()
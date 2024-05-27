import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

function initBoids() {
    const boidCount = 200
    const boids = new THREE.Group()

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

function rotateBoid(boid) {
    let targetQuaternion = new THREE.Quaternion();
    targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), boid.direction.clone().normalize());
    boid.quaternion.slerp(targetQuaternion, 0.1);
}

function avoidBoids(boid, boids) {
    boids.children.forEach(otherBoid => {
        if (boid !== otherBoid) {
            const distance = boid.position.distanceTo(otherBoid.position)
            if (distance < 5) {
                // move away from other boid
                const away = boid.position.clone().sub(otherBoid.position).normalize()
                boid.direction.add(away)
            }
        }
    })
}

function limitSpeed(boid) {
    const maxSpeed = 0.1
    if (boid.direction.length() > maxSpeed) {
        boid.direction.normalize().multiplyScalar(maxSpeed)
    }
}

function moveTowardsCenterOfMass(boid, boids) {
    let centerX = 0
    let centerY = 0
    let centerZ = 0
    let nbNeighbors = 0
    boids.children.forEach(otherBoid => {
        const distance = boid.position.distanceTo(otherBoid.position)
        if (distance < 0.5) {
            boid.direction.add(otherBoid.direction)
            nbNeighbors++
        }
    })
    if (nbNeighbors > 0) {
        centerX /= nbNeighbors
        centerY /= nbNeighbors
        centerZ /= nbNeighbors
        const centerOfMass = new THREE.Vector3(centerX, centerY, centerZ)
        const centerOfMassDirection = centerOfMass.clone().sub(boid.position).normalize()
        boid.direction.add(centerOfMassDirection)
    }
}

function updatePosition(boid) {
    const speed = 0.1 // adjust the speed value to control the boid's movement speed
    boid.position.x += boid.direction.x * speed
    boid.position.y += boid.direction.y * speed
    boid.position.z += boid.direction.z * speed
}

function checkBounds(boid) {
    if (boid.position.x > 10 || boid.position.x < -10) {
        boid.direction.x *= -1
    }
    if (boid.position.y > 10 || boid.position.y < -10) {
        boid.direction.y *= -1
    }
    if (boid.position.z > 10 || boid.position.z < -10) {
        boid.direction.z *= -1
    }
}

function init() {
    camera.position.z = 12
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const boids = initBoids()

    // print all boids positions
    // boids.children.forEach(boid => {
    //     console.log(boid.position)
    //     console.log(boid.direction)
    // })

    const tick = () => {
        controls.update()

        renderer.render(scene, camera)

        // move all boids
        boids.children.forEach(boid => {
            rotateBoid(boid)
            avoidBoids(boid, boids)
            limitSpeed(boid)
            moveTowardsCenterOfMass(boid, boids)
            const maxDirection = 1.5
            if (boid.direction.length() > maxDirection) {
                boid.direction.normalize().multiplyScalar(maxDirection)
            }
            updatePosition(boid)
            checkBounds(boid)

            // limit the direction vector
        })

        window.requestAnimationFrame(tick)
    }
    tick()
}

init()
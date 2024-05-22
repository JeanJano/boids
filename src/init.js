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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

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
    const boidCount = 50
    const boids = new THREE.Group()

    for (let i = 0; i < boidCount; i++) {
        const geometry = new THREE.ConeGeometry(0.08, 0.4, 32)
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.x = Math.random() * 10 - 5
        mesh.position.y = Math.random() * 10 - 5
        mesh.position.z = Math.random() * 10 - 5
        boids.add(mesh)
    }

    scene.add(boids)

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
    
    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
}

function init() {
    camera.position.z = 12
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    initBoids()

    const tick = () =>
    {
        controls.update()

        renderer.render(scene, camera)

        window.requestAnimationFrame(tick)
    }
    tick()
}

init()
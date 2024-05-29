import * as THREE from 'three'
import * as dat from 'lil-gui'

const gui = new dat.GUI()

let bird = {
    separation: 0.5,
    alignment: 0,
    cohesion: 2,
    speed: 1.5,
}

gui.add(bird, 'separation', 0.1, 3, 0.1)
gui.add(bird, 'cohesion', 0.1, 5, 0.1)
gui.add(bird, 'alignment', -1, 1, 0.1)
gui.add(bird, 'speed', 0.1, 5, 0.1)

function moveTowardsCenterOfMass(boid, boids) {
    let centerX = 0
    let centerY = 0
    let centerZ = 0
    let nbNeighbors = 0
    boids.children.forEach(otherBoid => {
        const distance = boid.position.distanceTo(otherBoid.position)
        if (distance < bird.cohesion && boid !== otherBoid) {
            centerX += otherBoid.position.x
            centerY += otherBoid.position.y
            centerZ += otherBoid.position.z
            nbNeighbors++
            boid.direction.add(otherBoid.direction).multiplyScalar(2)
        }
    })
    if (nbNeighbors > 0) {
        centerX /= nbNeighbors
        centerY /= nbNeighbors
        centerZ /= nbNeighbors
        const centerOfMass = new THREE.Vector3(centerX, centerY, centerZ)
        const centerOfMassDirection = centerOfMass.clone().sub(boid.position).normalize().multiplyScalar(bird.alignment)
        boid.direction.add(centerOfMassDirection)
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
            if (distance < bird.separation) {
                // move away from other boid
                const away = boid.position.clone().sub(otherBoid.position).normalize().multiplyScalar(2)
                boid.direction.add(away)
            }
        }
    })
}

function speed(boid) {
    if (boid.direction.length() > bird.speed) {
        boid.direction.normalize().multiplyScalar(bird.speed)
    }
}

function updatePosition(boid) {
    const speed = 0.1
    boid.position.x += boid.direction.x * speed
    boid.position.y += boid.direction.y * speed
    boid.position.z += boid.direction.z * speed
}

function checkBounds(boid) {
    if (boid.position.x > 10 || boid.position.x < -10) {
        boid.direction.x = -boid.direction.x + (Math.random() - 0.5)
    }
    if (boid.position.y > 10 || boid.position.y < -10) {
        boid.direction.y = -boid.direction.x + (Math.random() - 0.5)
    }
    if (boid.position.z > 10 || boid.position.z < -10) {
        boid.direction.z =  -boid.direction.x + (Math.random() - 0.5)
    }
    boid.direction.normalize()
}

export { moveTowardsCenterOfMass, rotateBoid, avoidBoids, speed, updatePosition, checkBounds }
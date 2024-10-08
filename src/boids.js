import * as THREE from 'three'
import * as dat from 'lil-gui'

const gui = new dat.GUI()

let bird = {
    separation: 1.2,
    alignment: 0,
    cohesion: 2,
    speed: 1.5,
    minSpeed: 1.5,
    maxSpeed: 1.5,
}

// ajouter un facteur aleatoire pour la vitesse avec un vitesse min et max

gui.add(bird, 'separation', 0.1, 3, 0.1)
gui.add(bird, 'cohesion', 0.1, 5, 0.1)
gui.add(bird, 'alignment', -1, 1, 0.1)
// gui.add(bird, 'speed', 0.1, 5, 0.1)

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
    if (boid.name === 'Sketchfab_Scene') {
        let targetQuaternion = new THREE.Quaternion();
        targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), boid.direction.clone().normalize());
        boid.quaternion.slerp(targetQuaternion, 0.1);    
    } else {
        let targetQuaternion = new THREE.Quaternion();
        targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), boid.direction.clone().normalize());
        boid.quaternion.slerp(targetQuaternion, 0.1);
    }
}

function avoidBoids(boid, boids, predator, bounds) {
    let minDistance = Infinity
    boids.children.forEach(otherBoid => {
        if (boid !== otherBoid) {
            const distance = boid.position.distanceTo(otherBoid.position)
            if (distance < bird.separation) {
                // move away from other boid
                const away = boid.position.clone().sub(otherBoid.position).normalize().multiplyScalar(2)
                boid.direction.add(away)
            }
            if (distance < minDistance) {
                minDistance = distance
            }
        }
    })

    const predatorDistance = boid.position.distanceTo(predator.position)
    if (predatorDistance < 7) {
        const away = boid.position.clone().sub(predator.position).normalize().multiplyScalar(2)
        boid.direction.add(away)
    }
    if (predatorDistance < minDistance) {
        minDistance = predatorDistance
    }

    const raycaster = new THREE.Raycaster(boid.position, boid.direction, 0, 500)
    const intersects = raycaster.intersectObjects(bounds)
    if (intersects.length > 0 && intersects[0].distance < minDistance) {
        minDistance = intersects[0].distance
    }

    const speed = THREE.MathUtils.lerp(bird.minSpeed, bird.maxSpeed, minDistance / bird.separation)
    boid.direction.multiplyScalar(speed)

    boid.direction.normalize()
}

function speed(boid) {
    if (boid.direction.length() > bird.minSpeed) {
        boid.direction.normalize().multiplyScalar(bird.minSpeed)
    }
}

function updatePosition(boid) {
    const speed = 0.1
    boid.position.x += boid.direction.x * speed
    boid.position.y += boid.direction.y * speed
    boid.position.z += boid.direction.z * speed
}

function checkBounds(boid, bounds) {
    const raycaster = new THREE.Raycaster(boid.position, boid.direction, 0, 15);
    const intersects = raycaster.intersectObjects([bounds]);

    if (intersects.length > 0 && intersects[0].distance < 10) {
        boid.direction.reflect(intersects[0].face.normal);
    }
    boid.direction.normalize()
}

export { moveTowardsCenterOfMass, rotateBoid, avoidBoids, speed, updatePosition, checkBounds }
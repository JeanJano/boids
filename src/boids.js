import * as THREE from 'three'

function moveTowardsCenterOfMass(boid, boids) {
    let centerX = 0
    let centerY = 0
    let centerZ = 0
    let nbNeighbors = 0
    boids.children.forEach(otherBoid => {
        const distance = boid.position.distanceTo(otherBoid.position)
        if (distance < 1) {
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
        const centerOfMassDirection = centerOfMass.clone().sub(boid.position).normalize().multiplyScalar(0.25)
        boid.direction.add(centerOfMassDirection)
    }
    const maxDirection = 1.5
    if (boid.direction.length() > maxDirection) {
        boid.direction.normalize().multiplyScalar(maxDirection)
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
            if (distance < 0.5) {
                // move away from other boid
                const away = boid.position.clone().sub(otherBoid.position).normalize().multiplyScalar(2)
                boid.direction.add(away)
            }
        }
    })
}

function limitSpeed(boid) {
    const maxSpeed = 0.1
    const minSpeed = 0.01
    if (boid.direction.length() > maxSpeed) {
        boid.direction.normalize().multiplyScalar(maxSpeed)
    } else if (boid.direction.length() < minSpeed) {
        boid.direction.normalize().multiplyScalar(minSpeed)
    }
}

function updatePosition(boid) {
    const speed = 0.1 // adjust the speed value to control the boid's movement speed
    boid.position.x += boid.direction.x * speed
    boid.position.y += boid.direction.y * speed
    boid.position.z += boid.direction.z * speed
}

function checkBounds(boid) {
    if (boid.position.x > 30 || boid.position.x < -30) {
        boid.direction.x = -boid.direction.x + (Math.random() - 0.5)
    }
    if (boid.position.y > 15 || boid.position.y < -15) {
        boid.direction.y = -boid.direction.x + (Math.random() - 0.5)
    }
    if (boid.position.z > 15 || boid.position.z < -15) {
        boid.direction.z =  -boid.direction.x + (Math.random() - 0.5)
    }
    boid.direction.normalize()
}

export { moveTowardsCenterOfMass, rotateBoid, avoidBoids, limitSpeed, updatePosition, checkBounds }
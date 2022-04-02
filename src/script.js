import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 400 })


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */

const parameters = {}
parameters.count = 100000
parameters.size = .034
parameters.width = 7.26
parameters.radius = 4.2
parameters.branches = 7
parameters.spin = 1
parameters.randomness = 1.586
parameters.randomnessPower = 2
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'
parameters.height = 5

let galaxy = null
let galaxyGeometry = null
let galaxyMaterial = null


const generateGalaxy = () => {

    // Destroy old Galaxy - Clear everything
    if (galaxy !== null) {
        galaxyGeometry.dispose()
        galaxyMaterial.dispose()
        scene.remove(galaxy)
    }
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    // Geometry
    galaxyGeometry = new THREE.BufferGeometry()
    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin // When radius is bigger, Spin is bigger 
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        // Randomly Distibute Particles with parabolic reduction to the outside with middeling it throug an if statement 
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1) 
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < .5 ? 1 : -1)

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * Math.pow(radius+ randomX, 2)   // Random Radius with Circled branch Angles (cos & sin)
        positions[i3 + 1] = randomY * (Math.random() - .5) * parameters.height
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * Math.pow(radius+ randomZ, 2) 

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r // R from 0 to 1
        colors[i3 + 1] = mixedColor.g // G
        colors[i3 + 2] = mixedColor.b // B

    }
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Material
    galaxyMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })



    galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(galaxy)
}

gui.add(parameters, 'count').name('Stars Count').min(100).max(200000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').name('Stars Size').min(.001).max(.1).step(.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'width').name('Galaxy Width').min(1).max(15).step(.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').name('Galaxy Radius').min(.1).max(20).step(.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').name('Galaxy Branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').name('Galaxy Spin').min(-5).max(5).step(.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').name('Galaxy Randomness').min(0).max(2).step(.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').name('Galaxy RandomnessPower').min(1).max(10).step(1).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').name('Galaxy Inside Color').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').name('Galaxy Outside Color').onFinishChange(generateGalaxy)
gui.add(parameters, 'height').name('Galaxy height').min(1).max(10).step(0.01).onFinishChange(generateGalaxy)

generateGalaxy()
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
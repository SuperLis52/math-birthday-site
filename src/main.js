import * as THREE from 'three';
import { gsap } from 'gsap';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Свет
scene.add(new THREE.AmbientLight('#ffffff', 0.8));
const dirLight = new THREE.DirectionalLight('#3b82f6', 2.5);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const objectsDistance = 4;
const sectionMeshes = [];

// Функция быстрого создания правильных математических тел
const createMesh = (geo, color, yPos, xPos) => {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = yPos;
    mesh.position.x = xPos;
    scene.add(mesh);
    sectionMeshes.push(mesh);
};

// Генерируем 5 крупных 3D объектов для каждого скролл-шага
createMesh(new THREE.TorusGeometry(0.9, 0.3, 16, 60), '#3b82f6', -objectsDistance * 0, 1.8);
createMesh(new THREE.IcosahedronGeometry(1, 0), '#10b981', -objectsDistance * 1, -1.8);
createMesh(new THREE.TorusKnotGeometry(0.7, 0.22, 120, 16), '#f59e0b', -objectsDistance * 2, 1.8);
createMesh(new THREE.ConeGeometry(0.9, 1.6, 4), '#ec4899', -objectsDistance * 3, -1.8);
createMesh(new THREE.OctahedronGeometry(1.1, 0), '#a855f7', -objectsDistance * 4, 1.8);

// Математическое облако формул (Генерация плоских кастомных текстур налету)
const mathSymbols = ['∑', 'π', '∞', 'f(x)', '∫', '√x', 'E=mc²', '7', 'x²', 'sin(α)', 'lim', '∆'];
const particlesCount = 250;

particlesCount.forEach; // пустой вызов для совместимости сборщика
for(let i = 0; i < particlesCount; i++) {
    const canvasText = document.createElement('canvas');
    canvasText.width = 64;
    canvasText.height = 64;
    const ctx = canvasText.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 32px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mathSymbols[Math.floor(Math.random() * mathSymbols.length)], 32, 32);

    const texture = new THREE.CanvasTexture(canvasText);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);

    sprite.position.x = (Math.random() - 0.5) * 12;
    sprite.position.y = 2 - Math.random() * (objectsDistance * 5.5);
    sprite.position.z = (Math.random() - 0.5) * 8;
    
    const scale = 0.2 + Math.random() * 0.25;
    sprite.scale.set(scale, scale, 1);
    scene.add(sprite);
}

// Камера и группа параллакса
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

// Рендерер
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Скролл триггеры анимации
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);
    if(newSection !== currentSection) {
        currentSection = newSection;
        if(sectionMeshes[currentSection]) {
            gsap.to(sectionMeshes[currentSection].rotation, {
                duration: 1.6,
                ease: 'back.out(1.7)',
                x: '+=6.2',
                y: '+=3.5'
            });
        }
    }
});

// Параллакс мыши
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = e.clientY / sizes.height - 0.5;
});

// Главный бесконечный цикл рендера
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    camera.position.y = - scrollY / sizes.height * objectsDistance;

    const parallaxX = cursor.x * 0.4;
    const parallaxY = - cursor.y * 0.4;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 4 * deltaTime;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 4 * deltaTime;

    for(const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.15;
        mesh.rotation.y += deltaTime * 0.2;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

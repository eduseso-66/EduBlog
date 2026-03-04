// El objeto 3D se debio renderizar dentro del canva, pero ocurrio algun error que aun desconozco xd

let scene, camera, renderer, object;

function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Creamos un octaedro (forma geométrica limpia)
    const geometry = new THREE.OctahedronGeometry(2, 0);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    object = new THREE.Mesh(geometry, material);
    
    scene.add(object);
    camera.position.z = 5;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    object.rotation.y += 0.005;
    renderer.render(scene, camera);
}

// Seguimiento del ratón
document.addEventListener('mousemove', (e) => {
    if (!object) return;
    let mouseX = (e.clientX / window.innerWidth) - 0.5;
    let mouseY = (e.clientY / window.innerHeight) - 0.5;
    
    object.position.x = mouseX * 2;
    object.position.y = -mouseY * 2;
    object.rotation.x = mouseY * 2;
});

window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init3D();
new WOW().init(); // Inicializar Wow JS
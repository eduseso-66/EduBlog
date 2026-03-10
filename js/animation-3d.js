
(function () {
  'use strict';

  /* 
  UTILITIES
 */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* 
    PALETTE(mirrors CSS vars)
   */
  var C = {
    orange:   0xFFB347,
    green:    0xB2FFDA,
    dark:     0x1A2F23,
    cream:    0xFDFBF9,
    mint:     0x82c4a4,
    orange2:  0xffcc80,
  };


  var overlay = document.createElement('div');
  overlay.id  = 'intro-overlay';
  overlay.innerHTML = [
    '<canvas id="intro-canvas"></canvas>',
    '<div id="intro-ui">',
    '  <div id="intro-logo">EduBlog</div>',
    '  <div id="intro-subtitle">Una bitácora de viaje</div>',
    '  <button id="intro-enter">Entrar <span>→</span></button>',
    '</div>',
  ].join('');
  document.body.insertBefore(overlay, document.body.firstChild);


  var style = document.createElement('style');
  style.textContent = [
    '#intro-overlay {',
    '  position: fixed; inset: 0; z-index: 9999;',
    '  background: #0b1a12;',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: opacity 1.2s ease, visibility 1.2s ease;',
    '}',
    '#intro-overlay.fade-out { opacity: 0; visibility: hidden; pointer-events: none; }',
    '#intro-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }',
    '#intro-ui {',
    '  position: relative; z-index: 2;',
    '  text-align: center; pointer-events: none;',
    '}',
    '#intro-logo {',
    '  font-family: "Playfair Display", serif;',
    '  font-size: clamp(3rem, 8vw, 7rem);',
    '  font-weight: 700; font-style: italic;',
    '  background: linear-gradient(135deg, #B2FFDA 0%, #FFB347 60%, #ffcc80 100%);',
    '  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;',
    '  opacity: 0; transform: translateY(30px);',
    '  animation: introFadeUp 1s 0.4s ease forwards;',
    '}',
    '#intro-subtitle {',
    '  font-family: "Montserrat", sans-serif;',
    '  font-size: clamp(0.9rem, 2vw, 1.2rem);',
    '  letter-spacing: 0.25em; text-transform: uppercase;',
    '  color: rgba(178,255,218,0.7);',
    '  margin-top: 0.6em;',
    '  opacity: 0; transform: translateY(20px);',
    '  animation: introFadeUp 1s 0.9s ease forwards;',
    '}',
    '#intro-enter {',
    '  margin-top: 2.5rem;',
    '  font-family: "Montserrat", sans-serif;',
    '  font-size: 1rem; font-weight: 600;',
    '  letter-spacing: 0.12em; text-transform: uppercase;',
    '  color: #0b1a12;',
    '  background: linear-gradient(135deg, #B2FFDA, #FFB347);',
    '  border: none; border-radius: 50px;',
    '  padding: 0.75em 2.2em;',
    '  cursor: pointer; pointer-events: all;',
    '  opacity: 0;',
    '  animation: introFadeUp 1s 1.5s ease forwards;',
    '  transition: transform 0.25s ease, box-shadow 0.25s ease;',
    '  box-shadow: 0 0 0 0 rgba(178,255,218,0.4);',
    '}',
    '#intro-enter:hover {',
    '  transform: scale(1.06);',
    '  box-shadow: 0 8px 30px rgba(178,255,218,0.35);',
    '}',
    '#intro-enter span { display: inline-block; transition: transform 0.2s ease; }',
    '#intro-enter:hover span { transform: translateX(4px); }',
    '@keyframes introFadeUp {',
    '  to { opacity: 1; transform: translateY(0); }',
    '}',
    /* Blog content hidden until intro done */
    'body.intro-active > *:not(#intro-overlay):not(#canvas-container) { opacity: 0; }',
    'body.intro-done  > *:not(#canvas-container) { transition: opacity 0.8s ease; }',
  ].join('\n');
  document.head.appendChild(style);
  document.body.classList.add('intro-active');

  /*Intro Three.js scene */
  var iCanvas  = document.getElementById('intro-canvas');
  var iW = function(){ return window.innerWidth; };
  var iH = function(){ return window.innerHeight; };

  var iRenderer = new THREE.WebGLRenderer({ canvas: iCanvas, antialias: true, alpha: false });
  iRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  iRenderer.setSize(iW(), iH());
  iRenderer.setClearColor(0x0b1a12, 1);

  var iScene  = new THREE.Scene();
  var iCamera = new THREE.PerspectiveCamera(60, iW() / iH(), 0.1, 500);
  iCamera.position.set(0, 0, 22);

  /* Ambient + two colored point lights */
  iScene.add(new THREE.AmbientLight(0xffffff, 0.15));

  var lightA = new THREE.PointLight(C.green, 4, 60);
  lightA.position.set(-10, 8, 10);
  iScene.add(lightA);

  var lightB = new THREE.PointLight(C.orange, 3.5, 60);
  lightB.position.set(12, -6, 8);
  iScene.add(lightB);

  /* Star field (random 3 000 points) */
  var starCount = 3000;
  var starPos   = new Float32Array(starCount * 3);
  var starSizes = new Float32Array(starCount);
  for (var i = 0; i < starCount; i++) {
    starPos[i*3]   = (Math.random() - 0.5) * 400;
    starPos[i*3+1] = (Math.random() - 0.5) * 400;
    starPos[i*3+2] = (Math.random() - 0.5) * 400;
    starSizes[i]   = Math.random() * 1.5 + 0.3;
  }
  var starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('size',     new THREE.BufferAttribute(starSizes, 1));

  var starMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: [
      'attribute float size;',
      'uniform float uTime;',
      'varying float vAlpha;',
      'void main() {',
      '  vAlpha = 0.4 + 0.35 * sin(uTime * 1.2 + position.x * 0.03 + position.y * 0.02);',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  gl_PointSize = size * (300.0 / -mv.z);',
      '  gl_Position = projectionMatrix * mv;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'varying float vAlpha;',
      'void main() {',
      '  float d = length(gl_PointCoord - vec2(0.5));',
      '  if (d > 0.5) discard;',
      '  float a = smoothstep(0.5, 0.0, d) * vAlpha;',
      '  gl_FragColor = vec4(1.0, 1.0, 1.0, a);',
      '}',
    ].join('\n'),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  var stars = new THREE.Points(starGeo, starMat);
  iScene.add(stars);

  /*Hero icosahedron */
  var heroGeo  = new THREE.IcosahedronGeometry(4.5, 2);
  var heroMat  = new THREE.MeshStandardMaterial({
    color: C.dark,
    roughness: 0.08,
    metalness: 0.9,
    transparent: true,
    opacity: 0.82,
    envMapIntensity: 1,
  });
  var heroMesh = new THREE.Mesh(heroGeo, heroMat);
  iScene.add(heroMesh);

  /* Wireframe overlay */
  var wireMat  = new THREE.MeshBasicMaterial({
    color: C.green, wireframe: true, transparent: true, opacity: 0.22,
  });
  heroMesh.add(new THREE.Mesh(heroGeo, wireMat));

  /* Pulsing outer shell */
  var shellGeo = new THREE.IcosahedronGeometry(4.9, 2);
  var shellMat = new THREE.MeshBasicMaterial({
    color: C.orange, wireframe: true, transparent: true, opacity: 0.08,
  });
  var shell = new THREE.Mesh(shellGeo, shellMat);
  iScene.add(shell);

  /* Orbiting rings */
  function makeRing(radius, tube, color, opacity) {
    var g = new THREE.TorusGeometry(radius, tube, 4, 80);
    var m = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity });
    return new THREE.Mesh(g, m);
  }
  var ring1 = makeRing(7,   0.04, C.green,  0.45);
  var ring2 = makeRing(9.5, 0.03, C.orange, 0.28);
  var ring3 = makeRing(12,  0.025,C.mint,   0.18);
  ring1.rotation.x = Math.PI * 0.35;
  ring2.rotation.x = Math.PI * 0.55; ring2.rotation.z = 0.4;
  ring3.rotation.x = Math.PI * 0.2;  ring3.rotation.y = 0.8;
  iScene.add(ring1, ring2, ring3);

  /* Floating tetrahedra cluster */
  var floaters = [];
  var tetGeo   = new THREE.TetrahedronGeometry(0.55, 0);
  var floaterDefs = [
    { p:[-7, 3,-4],  c: C.green,  s: 1.0 },
    { p:[ 8,-2,-3],  c: C.orange, s: 1.3 },
    { p:[-5,-4,-6],  c: C.mint,   s: 1.3 },
    { p:[ 6, 5,-5],  c: C.green,  s: 0.9 },
    { p:[ 0, 7,-8],  c: C.orange2,s: 1.3 },
    { p:[-9,-1,-2],  c: C.mint,   s: 1.1 },
  ];
  floaterDefs.forEach(function(d) {
    var m = new THREE.MeshStandardMaterial({ color: d.c, roughness: 0.3, metalness: 0.2,
                                             transparent: true, opacity: 0.75 });
    var mesh = new THREE.Mesh(tetGeo, m);
    mesh.position.set(d.p[0], d.p[1], d.p[2]);
    mesh.scale.setScalar(d.s);
    iScene.add(mesh);
    floaters.push({ mesh: mesh, baseY: d.p[1], speed: 0.5 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2 });
  });

  /* Mouse parallax for intro */
  var iMouse = { tx: 0, ty: 0, x: 0, y: 0 };
  document.addEventListener('mousemove', function(e) {
    iMouse.tx = (e.clientX / iW() - 0.5) * 2;
    iMouse.ty = (e.clientY / iH() - 0.5) * 2;
  });

  /* Intro clock & loop  */
  var iClock    = new THREE.Clock();
  var introDone = false;
  var iFrame;

  function introLoop() {
    if (introDone) return;
    iFrame = requestAnimationFrame(introLoop);
    var t = iClock.getElapsedTime();

    iMouse.x = lerp(iMouse.x, iMouse.tx, 0.04);
    iMouse.y = lerp(iMouse.y, iMouse.ty, 0.04);

    /* Gentle camera drift */
    iCamera.position.x = lerp(iCamera.position.x, iMouse.x * 2.5, 0.03);
    iCamera.position.y = lerp(iCamera.position.y, -iMouse.y * 1.5, 0.03);
    iCamera.lookAt(0, 0, 0);

    /* Hero rotation + morph-like breathing */
    heroMesh.rotation.y += 0.0045;
    heroMesh.rotation.x  = Math.sin(t * 0.3) * 0.15;
    var pulse = 1 + Math.sin(t * 1.1) * 0.025;
    heroMesh.scale.setScalar(pulse);
    shell.rotation.y -= 0.002;
    shell.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04);

    /* Rings orbit */
    ring1.rotation.z += 0.004;
    ring2.rotation.z -= 0.003;
    ring3.rotation.y += 0.002;

    /* Floaters */
    floaters.forEach(function(f) {
      f.mesh.rotation.x += 0.012;
      f.mesh.rotation.y += 0.009;
      f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * 0.7;
    });

    /* Star field slow rotation + twinkle */
    stars.rotation.y  = t * 0.008;
    starMat.uniforms.uTime.value = t;

    lightA.position.x = Math.cos(t * 0.4) * 14;
    lightA.position.z = Math.sin(t * 0.4) * 10;
    lightB.position.x = Math.sin(t * 0.3) * 16;
    lightB.position.y = Math.cos(t * 0.35) * 10;

    iRenderer.render(iScene, iCamera);
  }

  introLoop();

  /* resize */
  window.addEventListener('resize', function() {
    iCamera.aspect = iW() / iH();
    iCamera.updateProjectionMatrix();
    iRenderer.setSize(iW(), iH());
  });

  /* Exit transition */
  function exitIntro() {
    introDone = true;
    cancelAnimationFrame(iFrame);

    overlay.classList.add('fade-out');
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-done');

    /* Make all content visible */
    var all = document.body.querySelectorAll(':scope > *:not(#intro-overlay):not(#canvas-container)');
    all.forEach(function(el) { el.style.opacity = '1'; });

    /* After fade, destroy intro renderer to free memory */
    setTimeout(function() {
      overlay.remove();
      iRenderer.dispose();
      startBgScene();   
    }, 1400);
  }

  document.getElementById('intro-enter').addEventListener('click', exitIntro);



  /*
     BACKGROUND SCENE (after intro)
 */
  function startBgScene() {
    var container = document.getElementById('canvas-container');
    var W = function(){ return window.innerWidth; };
    var H = function(){ return window.innerHeight; };

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    container.appendChild(renderer.domElement);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 200);
    camera.position.set(0, 0, 28);

    /* Lights */
    scene.add(new THREE.AmbientLight(C.cream, 0.55));
    var kLight = new THREE.DirectionalLight(C.orange, 1.2);
    kLight.position.set(10, 12, 8);
    scene.add(kLight);
    scene.add(new THREE.DirectionalLight(C.green, 0.7)).position.set(-12,-6,6);
    var pLight = new THREE.PointLight(C.orange, 2.2, 40);
    pLight.position.set(5, 5, 5);
    scene.add(pLight);

    /* Particle field */
    var PC = 700;
    var pp = new Float32Array(PC * 3);
    var ps = new Float32Array(PC);
    for (var i = 0; i < PC; i++) {
      pp[i*3]   = (Math.random()-0.5)*110;
      pp[i*3+1] = (Math.random()-0.5)*70;
      pp[i*3+2] = (Math.random()-0.5)*55;
      ps[i]     = Math.random()*1.6+0.4;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    pGeo.setAttribute('size',     new THREE.BufferAttribute(ps, 1));

    var pMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(C.mint) } },
      vertexShader: [
        'attribute float size; uniform float uTime; varying float vA;',
        'void main(){',
        '  vec3 pos=position;',
        '  pos.y+=sin(uTime*0.3+position.x*0.05)*0.4;',
        '  pos.x+=cos(uTime*0.2+position.z*0.05)*0.3;',
        '  vA=0.22+0.18*sin(uTime+position.z*0.1);',
        '  vec4 mv=modelViewMatrix*vec4(pos,1.0);',
        '  gl_PointSize=size*(260.0/-mv.z);',
        '  gl_Position=projectionMatrix*mv;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor; varying float vA;',
        'void main(){',
        '  float d=length(gl_PointCoord-vec2(0.5));',
        '  if(d>0.5)discard;',
        '  gl_FragColor=vec4(uColor,smoothstep(0.5,0.1,d)*vA);',
        '}',
      ].join('\n'),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* Floating shapes */
    var shapes = [];
    function mk(geo, color, rough, metal, opacity) {
      var mat = new THREE.MeshStandardMaterial({
        color: color, roughness: rough||0.3, metalness: metal||0.1,
        transparent: true, opacity: opacity||0.65,
      });
      var mesh = new THREE.Mesh(geo, mat);
      return mesh;
    }
    function addShape(mesh, x, y, z, rx, ry, phase, amp) {
      mesh.position.set(x, y, z);
      scene.add(mesh);
      shapes.push({ mesh: mesh, rx: rx, ry: ry, phase: phase, amp: amp, baseY: y });
    }

    var icoG = new THREE.IcosahedronGeometry(3.0, 1);
    var ico  = mk(icoG, C.green, 0.2, 0.15, 0.68);
    ico.add(new THREE.Mesh(icoG, new THREE.MeshBasicMaterial({ color: C.dark, wireframe:true, transparent:true, opacity:0.15 })));
    addShape(ico, 7, 1, -5, 0.003, 0.006, 0, 0.6);

    var octG = new THREE.OctahedronGeometry(1.9, 0);
    addShape(mk(octG, C.orange, 0.4, 0.05, 0.65), -8, -1.5, -3, 0.005, 0.004, 1.5, 0.85);

    var dodG = new THREE.DodecahedronGeometry(1.5, 0);
    addShape(mk(dodG, C.mint, 0.25, 0.2, 0.62), 5, 5, -8, 0.004, 0.007, 0.8, 0.5);

    var tG  = new THREE.TetrahedronGeometry(0.9, 0);
    var tDefs = [[-4,4,-2,C.orange],[ 2,-4,-4,C.green],[-6,-4,-1,C.mint],[9,-3,-6,C.orange],[-2,2,-10,C.green]];
    tDefs.forEach(function(d, j) {
      addShape(mk(tG, d[3], 0.35, 0.05, 0.65), d[0], d[1], d[2], 0.006+j*0.001, 0.007-j*0.001, j, 0.7);
    });

    var tkG = new THREE.TorusKnotGeometry(1.7, 0.32, 110, 14);
    var tk  = mk(tkG, C.green, 0.15, 0.3, 0.28);
    addShape(tk, -3, -6, -12, 0.004, 0.003, 2, 0.4);

    /* Mouse + scroll */
    var mouse = { x:0, y:0, tx:0, ty:0 };
    var scrollY = 0;
    document.addEventListener('mousemove', function(e) {
      mouse.tx = (e.clientX/W()-0.5)*2;
      mouse.ty = (e.clientY/H()-0.5)*2;
    });
    window.addEventListener('scroll', function() { scrollY = window.scrollY; });
    window.addEventListener('resize', function() {
      camera.aspect = W()/H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    });

    var clock2 = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      var t = clock2.getElapsedTime();

      mouse.x = lerp(mouse.x, mouse.tx, 0.04);
      mouse.y = lerp(mouse.y, mouse.ty, 0.04);
      camera.position.x = mouse.x * 1.7;
      camera.position.y = -mouse.y * 1.1 - scrollY * 0.004;
      camera.lookAt(0, -scrollY * 0.003, 0);

      pLight.position.x = Math.sin(t*0.5)*13;
      pLight.position.y = Math.cos(t*0.4)*8;
      pLight.position.z = 6+Math.sin(t*0.3)*4;

      shapes.forEach(function(s) {
        s.mesh.rotation.x += s.rx;
        s.mesh.rotation.y += s.ry;
        s.mesh.position.y = s.baseY + Math.sin(t*0.7+s.phase)*s.amp;
      });

      pMat.uniforms.uTime.value = t;
      particles.rotation.y = t*0.011;
      particles.rotation.x = t*0.005;

      renderer.render(scene, camera);
    })();
  }

})();
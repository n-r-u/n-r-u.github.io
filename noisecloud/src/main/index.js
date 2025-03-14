        // import * as THREE from '/node_modules/three';
        // import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
        // import * as THREE from 'three';
        // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
        
        // import * as THREE from 'three/build/three.module.js';
        // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
        // Three.js background setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 2000);
        const renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('bg-canvas'),
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        let clock, deltaTime;
        clock = new THREE.Clock();
        
        const cloudSizes = [500, 500, 500];
        const cloudColors = [ new THREE.Color(0xDA70D6), new THREE.Color(0xf49d6c),new THREE.Color(0xF88379)];
        let clouds = [];
        let particleSystems = [];

        let loader = new THREE.TextureLoader();
        let skyboxTexture = loader.load('/assets/skyboxYes.jpg');

        // // Create the skybox geometry and material
        let skyboxGeometry = new THREE.SphereGeometry(910, 60, 60);
        let skyboxMaterial = new THREE.MeshBasicMaterial({
          map: skyboxTexture,
          side: THREE.BackSide
        });

        // // Create the skybox mesh
        let skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        scene.add(skybox);

        // Position camera
        camera.position.z = 0;
        camera.position.x = 0;
        camera.position.y = 0;


        const cloudPositions = [
            new THREE.Vector3(-500, 0, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(500, 0, 0),
        ];

        const gltfLoader = new GLTFLoader();
        const objectPositions = [
            new THREE.Vector3(15,5,-12),
            new THREE.Vector3(5,-5,-12),
            new THREE.Vector3(-5,-5,-12),
            new THREE.Vector3(-25,-7,-22),
            new THREE.Vector3(25,-7,-22),//turkoois interna
            new THREE.Vector3(-12,3,-10),
            new THREE.Vector3(-35,38,-70),//sign language
            new THREE.Vector3(5,7,-14)
        ];
        function addLights() {
            // Ambient light for base illumination
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            // Directional light to create shadows and dimension
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            
            // Hemisphere light for more natural environmental lighting
            const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6);
            scene.add(hemisphereLight);
        }

        // Call this function after scene creation
        addLights();

        const models = []; // Array to store models

        function loadGLBObjects() {
            for (let i = 1; i <= 8; i++) {
                let filePath = `./src/experience/assets/glb/object${i}.glb`;    

                if (i == 1) filePath = './src/experience/assets/glb/automaticcaptions_glb.glb';
                if (i == 2) filePath = './src/experience/assets/glb/deaf_architecture_GLB.glb';
                if (i == 3) filePath = './src/experience/assets/glb/deaf_community_GLB.glb';
                if (i == 4) filePath = './src/experience/assets/glb/deaf_poetry_glb.glb';
                if (i == 5) filePath = './src/experience/assets/glb/internationalization_glb.glb';
                if (i == 6) filePath = './src/experience/assets/glb/mainstreammedia_GLB.glb';
                if (i == 7) filePath = './src/experience/assets/glb/sign_language_GLB.glb';
                if (i == 8) filePath = './src/experience/assets/glb/spoken_GLB.glb';

                const position = objectPositions[i - 1];

                gltfLoader.load(
                    filePath,
                    (gltf) => {
                        const model = gltf.scene;
                        model.position.copy(position);
                        model.scale.set(2, 2, 2);
                        model.rotation.y = -1; // Initial rotation

                        // Store reference to animate later
                        models.push(model);

                        scene.add(model);
                        console.log(`Loaded object ${i}`);
                    },
                    (xhr) => {
                        console.log(`${filePath} ${(xhr.loaded / xhr.total * 100)}% loaded`);
                    },
                    (error) => {
                        console.error(`Error loading ${filePath}:`, error);
                    }
                );
            }
        }


        // Load the 3D objects
        loadGLBObjects();

        // Arrow navigation
        document.getElementById('next-section').addEventListener('click', function() {
            const sections = document.querySelectorAll('.section');
            const activeDot = document.querySelector('.nav-dot.active');
            const activeIndex = Array.from(document.querySelectorAll('.nav-dot')).indexOf(activeDot);
            
            if (activeIndex < sections.length - 1) {
                const nextSection = document.getElementById(
                    document.querySelectorAll('.nav-dot')[activeIndex + 1].getAttribute('data-section')
                );
                nextSection.scrollIntoView({ behavior: 'smooth' });
                
                document.querySelector('.nav-dot.active').classList.remove('active');
                document.querySelectorAll('.nav-dot')[activeIndex + 1].classList.add('active');
            }
        });

        document.getElementById('prev-section').addEventListener('click', function() {
            const activeDot = document.querySelector('.nav-dot.active');
            const activeIndex = Array.from(document.querySelectorAll('.nav-dot')).indexOf(activeDot);
            
            if (activeIndex > 0) {
                const prevSection = document.getElementById(
                    document.querySelectorAll('.nav-dot')[activeIndex - 1].getAttribute('data-section')
                );
                prevSection.scrollIntoView({ behavior: 'smooth' });
                
                document.querySelector('.nav-dot.active').classList.remove('active');
                document.querySelectorAll('.nav-dot')[activeIndex - 1].classList.add('active');
            }
        });

        // Read More Toggle Functionality
        const readMoreBtn = document.getElementById('read-more');
        const readMoreOverlay = document.getElementById('read-more-overlay');
        const readMoreImageContainer = document.getElementById('read-more-image-container');
        const readMoreTextContainer = document.getElementById('read-more-text-container');
        const closeButton = document.getElementById('close-button');
        let readMoreActive = false;

        // Prevent clicks on the overlay content from closing it
        readMoreOverlay.addEventListener('click', function(event) {
            // Only close if clicking directly on the overlay background
            if (event.target === readMoreOverlay) {
                closeReadMore();
            }
        });
        readMoreImageContainer.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        readMoreTextContainer.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        // Close button functionality
        closeButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent event bubbling
            closeReadMore();
        });

        // ESC key functionality
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && readMoreActive) {
                closeReadMore();
            }
        });
        

        // Function to close the read-more overlay
        // Function to close the read-more overlay
        function closeReadMore() {
            if (readMoreActive) {
                // Hide elements with animation
                readMoreImageContainer.classList.remove('active');
                readMoreTextContainer.classList.remove('active');
                
                // Hide overlay after animations
                setTimeout(() => {
                    readMoreOverlay.style.display = 'none';
                }, 500);
                
                readMoreActive = false;
            }
        }

        // Read More button click handler
        readMoreBtn.addEventListener('click', function() {
            if (!readMoreActive) {
                // Show the overlay
                readMoreOverlay.style.display = 'block';
                
                // Animate elements
                setTimeout(() => {
                    readMoreImageContainer.classList.add('active');
                    readMoreTextContainer.classList.add('active');
                }, 100);
                
                readMoreActive = true;
            } else {
                closeReadMore();
            }
        });
        for (let i = 0; i < 3; i++) {

            const cloud = createOrganicCloud(cloudPositions[i], cloudSizes[i], cloudColors[i]);
            clouds.push(cloud);
            particleSystems.push(cloud.geometry);
        }
        // Animate
        function animate() {
            requestAnimationFrame(animate);
            update();
            // Rotate skybox slowly
            skybox.rotation.y += 0.0005;
            skybox.rotation.x += 0.0002;
            
            renderer.render(scene, camera);
            

                // Rotate each model on the Y-axis
            models.forEach(model => {
                model.rotation.y += 0.004; // Adjust speed as needed
            });

            renderer.render(scene, camera);
            

            // Start animation
            

        }

        function createOrganicCloud(center, radius, color) {
            const particleCount = 20000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for  (let i = 0; i < particleCount; i++) {
                const x = (Math.random() - 0.5) * radius * (Math.random() < 0.7 ? 1.3 : 1);
                const y = (Math.random() - 0.5) * radius * (Math.random() < 0.8 ? 0.6 : 1);
                const z = (Math.random() - 0.5) * radius * 2.8 * (Math.random() < 0.8 ? 0.6 : 1);

                positions[i * 3] = center.x + x;
                positions[i * 3 + 1] = center.y + y;
                positions[i * 3 + 2] = center.z + z;

                let colorIndex = Math.floor(Math.random() * 3);
                switch (colorIndex) {
                    case 0:
                        colors[i * 3] = cloudColors[0].r; // Red
                        colors[i * 3 + 1] = cloudColors[0].g;
                        colors[i * 3 + 2] = cloudColors[0].b;
                        break;
                    case 1:
                        colors[i * 3] = cloudColors[1].r; // Orange
                        colors[i * 3 + 1] = cloudColors[1].g;
                        colors[i * 3 + 2] = cloudColors[1].b;
                        break;
                    case 2:
                        colors[i * 3] = cloudColors[2].r; // Pink
                        colors[i * 3 + 1] = cloudColors[2].g;
                        colors[i * 3 + 2] = cloudColors[2].b;
                        break;
                }
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 4,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                sizeAttenuation: true,
                map: loader.load('/assets/circle5.png'), // Circular particle texture
                alphaTest: 0.5,
            });

            const cloud = new THREE.Points(geometry, material);
            scene.add(cloud);
            return cloud;
        }
        
        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Navigation functionality
        const sections = document.querySelectorAll('.section');
        const navDots = document.querySelectorAll('.nav-dot');
        const content = document.getElementById('content');

        // Update active dot based on scroll position
        content.addEventListener('scroll', () => {
            const scrollPosition = content.scrollTop;
            
            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop - sectionHeight / 3) {
                    navDots.forEach(dot => dot.classList.remove('active'));
                    navDots[index].classList.add('active');
                }
            });
        });
        function update() {
            deltaTime = clock.getDelta();

            particleSystems.forEach((particles, cloudIndex) => {
                const positions = particles.attributes.position.array;
                const originalPositions = particles.getAttribute('originalPosition')?.array || positions;

                if (!particles.getAttribute('originalPosition')) {
                    particles.setAttribute('originalPosition', new THREE.BufferAttribute(positions.slice(), 3));
                    particles.setAttribute('velocities', new THREE.BufferAttribute(new Float32Array(positions.length), 3));
                }

                const velocities = particles.getAttribute('velocities').array;
                const maxDisplacement = 20;

                for (let i = 0; i < positions.length; i += 3) {
                    // Add velocity to position
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];

                    // Calculate displacement from original position
                    const dx = positions[i] - originalPositions[i];
                    const dy = positions[i + 1] - originalPositions[i + 1];
                    const dz = positions[i + 2] - originalPositions[i + 2];

                    const displacement = Math.sqrt(dx*dx + dy*dy + dz*dz);

                    // If displacement exceeds max, reverse velocity
                    if (displacement > maxDisplacement) {
                        velocities[i] *= -0.002;
                        velocities[i + 1] *= -0.002;
                        velocities[i + 2] *= -0.002;

                        // Reposition to max boundary
                        const factor = maxDisplacement / displacement;
                        positions[i] = originalPositions[i] + dx * factor;
                        positions[i + 1] = originalPositions[i + 1] + dy * factor;
                        positions[i + 2] = originalPositions[i + 2] + dz * factor;
                    }

                    // Add some random fluctuation to velocity
                    velocities[i] += (Math.random() - 0.5) * 0.0003;
                    velocities[i + 1] += (Math.random() - 0.5) * 0.0003;
                    velocities[i + 2] += (Math.random() - 0.5) * 0.0003;
                }

                particles.attributes.position.needsUpdate = true;
                particles.attributes.velocities.needsUpdate = true;
            });
        }

        // Dot click navigation
        navDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetSection = document.getElementById(dot.dataset.section);
                content.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
            });
        });

        // Button functionality
        // document.getElementById('read-more').addEventListener('click', () => {
            // Replace with your "Read More" functionality
            // window.open('/more-info.html', '_blank');
        // });

        document.getElementById('start-experience').addEventListener('click', () => {
            // Replace with your "Start Experience" functionality
            window.location.href = '/experience.html';
        });
    
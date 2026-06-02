// ParticlesSwarm class for Platen Phase 2 (Three.js WebGL)
// by Antigravity (Advanced Agentic Coding)

class ParticlesSwarm {
    constructor(container, panelId, count = 20000) {
        this.count = count;
        this.container = container;
        this.panelId = panelId;
        this.speedMult = 0.6; // Gentle breathing drift
        this.isRunning = false;
        this.rafId = null;

        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        
        // Sizing
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 400;
        this.height = rect.height || 600;

        // Perspective Camera
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 2000);
        this.camera.position.set(0, 0, 110);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Create Glyph Atlas Texture
        this.atlasTexture = this.createGlyphAtlas();

        // Check canvas theme to assign high-contrast initial particle color
        const panelEl = document.getElementById('panel' + this.panelId);
        const isBlackCanvas = panelEl ? panelEl.classList.contains('canvas-black') : false;
        const pColor = isBlackCanvas ? new THREE.Vector3(0.9, 0.9, 0.9) : new THREE.Vector3(0.11, 0.11, 0.13);

        // Create Custom ShaderMaterial
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 },
                uAtlas: { value: this.atlasTexture },
                uColor: { value: pColor }
            },
            vertexShader: `
                uniform float uTime;
                attribute float aGlyph;
                attribute float aLevel;
                attribute vec3 aTarget;
                varying float vGlyph;
                varying float vLevel;

                void main() {
                    vGlyph = aGlyph;
                    vLevel = aLevel;

                    // Interpolate smoothly towards targets with soft breathing drift
                    vec3 pos = mix(position, aTarget, 0.1);
                    
                    // Add organic 3D drift over time
                    pos.x += sin(uTime * 0.7 + position.y * 0.04) * 2.2;
                    pos.y += cos(uTime * 0.8 + position.x * 0.04) * 2.2;
                    pos.z += sin(uTime * 0.6 + position.z * 0.04) * 2.2;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Attenuate point size by distance to keep 3D volume feel
                    gl_PointSize = (12.0 + aLevel * 10.0) * (300.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform sampler2D uAtlas;
                varying float vGlyph;
                varying float vLevel;

                void main() {
                    // Sample from 5 horizontal glyph cells in the atlas
                    float cellWidth = 0.2; // 1.0 / 5.0
                    float cellOffset = floor(vGlyph + 0.5) * cellWidth;
                    
                    vec2 uv = gl_PointCoord;
                    // Clamp to prevent edge artifacts
                    uv = clamp(uv, 0.02, 0.98);
                    uv.x = uv.x * cellWidth + cellOffset;

                    vec4 texColor = texture2D(uAtlas, uv);
                    if (texColor.a < 0.15) discard;

                    // Crisp rich ink coloring with soft opacity driven by depth/level
                    gl_FragColor = vec4(uColor, texColor.a * (0.35 + 0.65 * (vLevel / 5.0)));
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        // Initialize particles driven by Platen front-face print mapping
        this.initGeometry();

        // Clock & Bindings
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);

        // Resize Observer
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.container);
    }

    createGlyphAtlas() {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size * 5;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw five Courier monospace typewriter glyphs: / . + X *
        const glyphs = ['/', '.', '+', 'X', '*'];
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold ' + Math.floor(size * 0.9) + 'px Courier, "Courier New", monospace';

        for (let i = 0; i < glyphs.length; i++) {
            const x = i * size + size / 2;
            const y = size / 2;
            ctx.clearRect(i * size, 0, size, size);
            ctx.fillText(glyphs[i], x, y);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        return texture;
    }

    initGeometry() {
        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(this.count * 3);
        const targets = new Float32Array(this.count * 3);
        const glyphs = new Float32Array(this.count);
        const levels = new Float32Array(this.count);

        // Fetch resolved print composition from the front face
        const flowers = (window._lastFlowers && window._lastFlowers[this.panelId]) || [];

        // Grid layout calculations (cube-grid simulation)
        const s = Math.ceil(Math.pow(this.count, 1/3));
        const sep = 2.4; 
        const off = (s * sep) / 2;

        for (let i = 0; i < this.count; i++) {
            // Initial positions scattered organically in 3D volume
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

            // Target cube coordinates
            const z = Math.floor(i / (s * s));
            const y = Math.floor((i % (s * s)) / s);
            const x = i % s;
            targets[i * 3] = x * sep - off;
            targets[i * 3 + 1] = y * sep - off;
            targets[i * 3 + 2] = z * sep - off;

            // Fetch actual density weight from corresponding front flower
            const f = flowers.length > 0 ? flowers[i % flowers.length] : null;
            const wt = f ? f.wt : (Math.random() * 0.7 + 0.2);

            // Map density level to glyph type and point size
            let level = 1;
            let glyphIdx = 0;
            if (wt < 0.36) { level = 1; glyphIdx = 0; }
            else if (wt < 0.51) { level = 2; glyphIdx = 1; }
            else if (wt < 0.66) { level = 3; glyphIdx = 2; }
            else if (wt < 0.81) { level = 4; glyphIdx = 3; }
            else { level = 5; glyphIdx = 4; }

            glyphs[i] = glyphIdx;
            levels[i] = level;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
        this.geometry.setAttribute('aGlyph', new THREE.BufferAttribute(glyphs, 1));
        this.geometry.setAttribute('aLevel', new THREE.BufferAttribute(levels, 1));

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    update() {
        if (!this.geometry) return;
        const glyphsAttr = this.geometry.getAttribute('aGlyph');
        const levelsAttr = this.geometry.getAttribute('aLevel');
        if (!glyphsAttr || !levelsAttr) return;

        // Update color uniform based on current canvas theme class
        const panelEl = document.getElementById('panel' + this.panelId);
        const isBlackCanvas = panelEl ? panelEl.classList.contains('canvas-black') : false;
        if (this.material && this.material.uniforms && this.material.uniforms.uColor) {
            this.material.uniforms.uColor.value.set(
                isBlackCanvas ? 0.9 : 0.11,
                isBlackCanvas ? 0.9 : 0.11,
                isBlackCanvas ? 0.95 : 0.13
            );
        }

        const flowers = (window._lastFlowers && window._lastFlowers[this.panelId]) || [];

        for (let i = 0; i < this.count; i++) {
            const f = flowers.length > 0 ? flowers[i % flowers.length] : null;
            const wt = f ? f.wt : (Math.random() * 0.7 + 0.2);

            let level = 1;
            let glyphIdx = 0;
            if (wt < 0.36) { level = 1; glyphIdx = 0; }
            else if (wt < 0.51) { level = 2; glyphIdx = 1; }
            else if (wt < 0.66) { level = 3; glyphIdx = 2; }
            else if (wt < 0.81) { level = 4; glyphIdx = 3; }
            else { level = 5; glyphIdx = 4; }

            glyphsAttr.setX(i, glyphIdx);
            levelsAttr.setX(i, level);
        }

        glyphsAttr.needsUpdate = true;
        levelsAttr.needsUpdate = true;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.clock.getDelta(); // Reset clock delta
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    resize() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        if (!this.isRunning) return;
        this.rafId = requestAnimationFrame(this.animate);

        const time = this.clock.getElapsedTime() * this.speedMult;
        this.material.uniforms.uTime.value = time;

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.stop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.atlasTexture) this.atlasTexture.dispose();
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        this.scene.remove(this.points);
    }
}

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /@import url\('https:\/\/fonts.googleapis.com\/css2\?family=IBM\+Plex\+Mono:wght@400;500&family=JetBrains\+Mono:wght@400;500&display=swap'\);/g,
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap');
);

html = html.replace(
  /:root {[\s\S]*?}/,
  :root {
            --bg: #0C0B09;
            --panel: #0C0B09;
            --border: #EDE7D9;
            --purple: #EDE7D9;
            --text: #EDE7D9;
            --text-2: #4A4640;
            --dim: rgba(237, 231, 217, 0.4);
            --rule: #1E1D1A;
            --canvas-bg: #0C0B09;
            --body-bg: #0C0B09;
            --shadow: drop-shadow(4px 4px 0px rgba(0, 0, 0, 1));
            --label-opacity: 0.5;
            --mono: 'JetBrains Mono', 'Courier New', monospace;
            --serif: 'Cormorant Garamond', serif;
        }

        [data-theme="light"] {
            --bg: #FAFAF8;
            --panel: #FAFAF8;
            --border: #141410;
            --purple: #141410;
            --text: #141410;
            --text-2: #6A6560;
            --dim: rgba(20, 20, 16, 0.4);
            --rule: #DDD8CE;
            --canvas-bg: #FAFAF8;
            --body-bg: #FAFAF8;
            --shadow: drop-shadow(4px 4px 0px rgba(0, 0, 0, 1));
            --label-opacity: 1.0;
        }
);

html = html.replace(/font-family: 'IBM Plex Mono', 'Courier New', monospace;/g, ont-family: var(--mono););
html = html.replace(/border-radius: 4px;/g, order-radius: 0;);
html = html.replace(/border-radius: 3px;/g, order-radius: 0;);
html = html.replace(/border-radius: 5px;/g, order-radius: 0;);

html = html.replace(
  /button {[\s\S]*?transition: all 0.15s;\s*}/,
  utton {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text);
            font-family: var(--mono);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.2em;
            padding: 8px 16px;
            cursor: pointer;
            text-transform: uppercase;
            border-radius: 0;
            transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
);

html = html.replace(
  /button:hover,\s*button\.active {[\s\S]*?}/,
  utton:hover,
        button.active {
            background: var(--text);
            color: var(--bg);
        }
);

html = html.replace(
  /button\.active {[\s\S]*?}/,
  `
);

html = html.replace(
  /#btn-randomize:hover,\s*#btn-randomize\.active {[\s\S]*?}/,
  #btn-randomize { border: 1px solid var(--text); }
        #btn-randomize:hover,
        #btn-randomize.active {
            background: var(--text);
            color: var(--bg);
            transform: translate(-2px, -2px);
            box-shadow: 4px 4px 0px var(--text);
        }
);

html = html.replace(
  /#btn-randomize:hover {[\s\S]*?}/,
  `
);

const mobileCss = \
        /* Aisthetic Cinematic Mobile Drawer */
        #settings-drawer {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 380px;
            max-width: 100vw;
            background: rgba(12, 11, 9, 0.6);
            backdrop-filter: blur(40px) saturate(150%);
            -webkit-backdrop-filter: blur(40px) saturate(150%);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            display: flex;
            flex-direction: column;
            border-left: 1px solid var(--rule);
        }
        
        [data-theme="light"] #settings-drawer {
            background: rgba(250, 250, 248, 0.6);
        }

        #settings-drawer.open {
            transform: translateX(0);
        }
        
        #settings-backdrop {
            position: fixed;
            inset: 0;
            background: transparent;
            z-index: 999;
            pointer-events: none;
            transition: background 0.6s ease;
        }
        #settings-backdrop.open {
            pointer-events: auto;
            background: rgba(0,0,0,0.2);
        }

        @media (max-width: 900px) {
            #traitbar { display: none !important; }
            #mobile-btn-settings { display: block; }
        }
        @media (min-width: 901px) {
            #mobile-btn-settings { display: none; }
        }
\;

html = html.replace(/<\/style>/, mobileCss + '\n    </style>');

const mobileBtn = \<button id="mobile-btn-settings" onclick="toggleSettingsDrawer()">[ SETTINGS ]</button>\;
html = html.replace(/<button id="btn-about" onclick="showAbout\(\)">About<\/button>/, mobileBtn + '\n                <button id="btn-about" onclick="showAbout()">About</button>');

const jsLogic = \
        function toggleSettingsDrawer() {
            var drawer = document.getElementById('settings-drawer');
            if(!drawer) {
                drawer = document.createElement('div');
                drawer.id = 'settings-drawer';
                
                var header = document.createElement('div');
                header.style.cssText = "padding: 20px; border-bottom: 1px solid var(--rule); display: flex; justify-content: space-between; align-items: center;";
                header.innerHTML = "<span style='font-family: var(--serif); font-size: 24px; font-style: italic;'>Settings</span><button onclick='toggleSettingsDrawer()'>[ CLOSE ]</button>";
                drawer.appendChild(header);

                var content = document.createElement('div');
                content.style.cssText = "padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;";
                
                var traitbar = document.getElementById('traitbar');
                content.appendChild(traitbar);
                traitbar.style.display = 'flex';
                traitbar.style.flexDirection = 'column';
                traitbar.style.border = 'none';
                traitbar.style.height = 'auto';
                traitbar.style.width = '100%';
                
                drawer.appendChild(content);

                var backdrop = document.createElement('div');
                backdrop.id = 'settings-backdrop';
                backdrop.onclick = toggleSettingsDrawer;
                
                document.body.appendChild(backdrop);
                document.body.appendChild(drawer);
            }
            
            var bd = document.getElementById('settings-backdrop');
            if (drawer.classList.contains('open')) {
                drawer.classList.remove('open');
                bd.classList.remove('open');
            } else {
                drawer.classList.add('open');
                bd.classList.add('open');
            }
        }
\;

html = html.replace(/<\/script>/, jsLogic + '\n    </script>');

html = html.replace(
  /#title {[\s\S]*?}/,
  #title {
            font-family: var(--serif);
            font-size: 24px;
            font-style: italic;
            font-weight: 400;
            color: var(--text);
            margin-right: 40px;
            letter-spacing: normal;
            text-transform: none;
        }
);

fs.writeFileSync('index.html', html);
console.log('Mobile UI Overhaul injected');

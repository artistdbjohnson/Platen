const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Replace variations of motif === 'typewriter'
content = content.replace(/traits\.motif === 'typewriter'/g, "(traits.motif === 'typewriter' || traits.motif === 'chopin')");
content = content.replace(/TRAITS\.motif === 'typewriter'/g, "(TRAITS.motif === 'typewriter' || TRAITS.motif === 'chopin')");
content = content.replace(/runTraits\.motif === 'typewriter'/g, "(runTraits.motif === 'typewriter' || runTraits.motif === 'chopin')");
content = content.replace(/art\.traits\.motif === 'typewriter'/g, "(art.traits.motif === 'typewriter' || art.traits.motif === 'chopin')");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements complete.');

// PLATEN · by douglxss · github.com/artistdbjohnson/Platen
// ── CORE DATA & CONFIG ────────────────────────────────────────────────────────
// Centralized configuration and math helpers used by workers and UI

// ── Chromes (cohesive families from catalog color plates + Near Eastern dyes) ──
// All hex values extracted from gallery color plates via pixel sampling.
// r = relative weight (higher = more frequent), v = variant accent flag.
var PALETTES = {
    typewriter_ribbon_multicolored: [  // multicolored typewriter ribbon inks
        { c: "#1D1D1D", r: 4 },       // Carbon Black Ribbon - Pen 199 Black
        { c: "#7C2A24", r: 3 },       // Red Carbon / Bicolor - Pen 223 Dark Red
        { c: "#1B4D3E", r: 2 },       // Carbon Teal - Pen 156 Cobalt Green
        { c: "#8D5B4C", r: 2 },       // Aged Sepia - Pen 188 Sanguine
        { c: "#1E4E79", r: 2 },       // Cobalt Blue - Pen 151
        { c: "#F9D949", r: 2 },       // Cadmium Yellow - Pen 107
        { c: "#4E3629", r: 1, v: 1 }  // Weathered ink bleed accent
    ],
    typewriter_black: [  // pure black monochrome typewriter ribbon ink
        { c: "#1D1D1D", r: 4 },       // Carbon Black - Pen 199 Black
        { c: "#111111", r: 2 },       // Stark Black
        { c: "#333333", r: 2 },       // Faded Black
        { c: "#121212", r: 1, v: 1 }  // Stark deep black carbon bleed
    ],
    typewriter_black_red: [  // bi-color black and red typewriter ribbon ink
        { c: "#1D1D1D", r: 5 },       // Carbon Black
        { c: "#7C2A24", r: 4 },       // Red Carbon / Bicolor - Pen 223 Dark Red
        { c: "#4E3629", r: 1, v: 1 }  // Weathered ink bleed accent
    ],
    chopin: [ // split ribbon red and blue
        { c: "#1D1D1D", r: 1 },       // Carbon Black
        { c: "#C02F2C", r: 4 },       // Ribbon Red
        { c: "#1B477D", r: 4 },       // Ribbon Blue
        { c: "#543355", r: 1, v: 1 }  // Overlap Purple
    ],
    weave_primary: [ // from user weaving image
        { c: "#C63A27", r: 3 },       // Deep Red/Orange
        { c: "#D99B35", r: 3 },       // Mustard Yellow
        { c: "#697A3B", r: 3 },       // Olive Green
        { c: "#2B658C", r: 3 },       // Mid Blue
        { c: "#1E5959", r: 3 },       // Teal
        { c: "#F2EAE4", r: 1, v: 1 }  // Cream/White
    ],
    railyard: [ // shipping container yard palette
        { c: "#e6007e", r: 3, v: 1 }, // Magenta container
        { c: "#f05a28", r: 3, v: 1 }, // Burnt Orange container
        { c: "#0055a4", r: 2, v: 1 }, // Cobalt Blue container
        { c: "#ffffff", r: 4 },       // White container / spacing
        { c: "#a0a5a9", r: 5 },       // Concrete / Gray ground
        { c: "#2a2b2d", r: 4 }        // Dark asphalt / Tracks
    ],
    micron_plotter: [ // Comprehensive, color-accurate set of 17 Sakura Pigma Micron plot pens
        { c: "#18181A", r: 3 },       // 1. Micron Black (Archival deep warm black)
        { c: "#B82E2E", r: 2 },       // 2. Micron Red (Archival classic red)
        { c: "#2B4570", r: 2 },       // 3. Micron Blue (Deep cobalt)
        { c: "#236B3B", r: 2 },       // 4. Micron Green (Mid kelly green)
        { c: "#633924", r: 2 },       // 5. Micron Brown (Chestnut)
        { c: "#5A3B73", r: 2 },       // 6. Micron Purple (Mid-violet)
        { c: "#3D2B24", r: 2 },       // 7. Micron Sepia (Dark umber)
        { c: "#CF597E", r: 2 },       // 8. Micron Rose (Saturated dusty rose)
        { c: "#6B1F2B", r: 2 },       // 9. Micron Burgundy (Dark wine)
        { c: "#1A4731", r: 2 },       // 10. Micron Hunter Green (Dark cool forest)
        { c: "#1C2638", r: 2 },       // 11. Micron Blue-Black (Dark navy)
        { c: "#1F5799", r: 2 },       // 12. Micron Royal Blue (Bright mid-blue)
        { c: "#68A635", r: 2 },       // 13. Micron Fresh Green (Yellow-leaning green)
        { c: "#E06B1B", r: 2 },       // 14. Micron Orange (Saturated mid-orange)
        { c: "#E8B723", r: 2 },       // 15. Micron Yellow (Warm golden yellow)
        { c: "#8C9196", r: 2 },       // 16. Micron Cool Gray (Mid-tone cool neutral)
        { c: "#BABBBC", r: 2 }        // 17. Micron Light Cool Gray (Light cool neutral)
    ],
    azulejo_classico: [  // classic blue and white tiles
        { c: "#fcfcfa", r: 4 },       // tile white/glaze
        { c: "#e8eff5", r: 2 },       // faint blue shadow
        { c: "#4884b8", r: 3 },       // cerulean/mid blue
        { c: "#1b3c73", r: 3 },       // cobalt deep
        { c: "#0c1a3b", r: 2 },       // navy edge
        { c: "#a3c2d1", r: 1, v: 1 }, // light blue accent
        { c: "#0f1626", r: 1 }        // near-black
    ],
    pombalino: [  // 18th century Lisbon multi-color tiles
        { c: "#f6f2e9", r: 3 },       // bone white
        { c: "#1a4c7a", r: 3 },       // classic blue
        { c: "#d4a044", r: 2 },       // mustard ochre
        { c: "#728a6f", r: 2 },       // sage green
        { c: "#5a3a41", r: 1, v: 1 }, // manganese burgundy
        { c: "#403126", r: 1 },       // dark umber
        { c: "#111b2b", r: 1 }        // near-black
    ],
    minho: [  // northern Portugal festive dress
        { c: "#d11f26", r: 4 },       // brilliant scarlet
        { c: "#1a1a1a", r: 3 },       // stark black
        { c: "#eaaa1c", r: 2 },       // golden yellow
        { c: "#1d7844", r: 2 },       // emerald green
        { c: "#fdfdfb", r: 1, v: 1 }, // bright white accent
        { c: "#8b1116", r: 2 },       // dark crimson
        { c: "#000000", r: 2 }        // pure black
    ],
    alentejo: [  // Arraiolos rugs / faded earth
        { c: "#dbcdb4", r: 3 },       // warm straw/beige
        { c: "#b26c51", r: 3 },       // terracotta rust
        { c: "#627a61", r: 2 },       // dusty olive
        { c: "#4c6b8c", r: 2 },       // faded indigo
        { c: "#d1a354", r: 1, v: 1 }, // muted ochre
        { c: "#4a3c31", r: 2 },       // warm brown
        { c: "#202020", r: 1 }        // soft black
    ],
    panar: [  // hemp canvas — warm parchment family
        { c: "#f8e8d0", r: 2 },       // lightest parchment
        { c: "#f8e0a0", r: 2 },       // golden parchment
        { c: "#c8a060", r: 3 },       // warm gold
        { c: "#886830", r: 2 },       // golden brown
        { c: "#584020", r: 2 },       // dark umber
        { c: "#883028", r: 1, v: 1 }, // sienna accent
        { c: "#201810", r: 3 }        // near-black
    ],
    rutsya: [  // red thread — the dominant embroidery reds
        { c: "#c82828", r: 3 },       // vermillion
        { c: "#883028", r: 2 },       // dark sienna
        { c: "#b84848", r: 2 },       // brick red
        { c: "#f05858", r: 1 },       // coral highlight
        { c: "#f8e0a0", r: 1, v: 1 }, // parchment accent
        { c: "#681818", r: 2 },       // blood dark
        { c: "#480810", r: 2 },       // near-black crimson
        { c: "#201810", r: 2 }        // deep dark
    ],
    tekhelet: [  // indigo — Judean desert blue dye family
        { c: "#505878", r: 3 },       // slate blue
        { c: "#101840", r: 3 },       // midnight blue
        { c: "#707088", r: 2 },       // blue-gray
        { c: "#8890a0", r: 2 },       // cool steel
        { c: "#c8a060", r: 1, v: 1 }, // warm gold accent
        { c: "#303028", r: 2 },       // dark olive
        { c: "#201810", r: 2 }        // deep dark
    ],
    argaman: [  // Tyrian purple — murex shell dye, the most precious
        { c: "#b02040", r: 3 },       // wine/crimson
        { c: "#505878", r: 2 },       // slate blue
        { c: "#883028", r: 2 },       // dark sienna
        { c: "#f05858", r: 1, v: 1 }, // coral accent
        { c: "#d89890", r: 1 },       // dusty rose
        { c: "#101840", r: 3 },       // midnight
        { c: "#480810", r: 2 }        // near-black
    ],
    karkom: [  // saffron gold — crocus dye, warm ceremonial
        { c: "#c8a060", r: 3 },       // warm gold
        { c: "#886830", r: 3 },       // golden brown
        { c: "#f8e0a0", r: 2 },       // parchment light
        { c: "#b07060", r: 2 },       // terracotta
        { c: "#f83038", r: 1, v: 1 }, // scarlet accent
        { c: "#584020", r: 2 },       // umber
        { c: "#303028", r: 2 }        // dark
    ],
    madder: [  // rubia root — Samarian red earth dye
        { c: "#b84848", r: 3 },       // brick red
        { c: "#d07870", r: 2 },       // dusty rose
        { c: "#b07060", r: 2 },       // terracotta
        { c: "#f0b898", r: 1 },       // peach
        { c: "#f8e0a0", r: 1, v: 1 }, // parchment accent
        { c: "#584020", r: 2 },       // dark umber
        { c: "#681818", r: 2 },       // dark blood
        { c: "#201810", r: 2 }        // near-black
    ],
    sintra: [ // Romanticist vibrant colors from Palácio da Pena
        { c: "#f4d03f", r: 4 }, // Pena Yellow
        { c: "#c0392b", r: 3 }, // Terracotta Red
        { c: "#1e8449", r: 3 }, // Forest Green
        { c: "#154360", r: 2 }, // Deep Navy
        { c: "#fbfcfc", r: 2 }, // Chalk White
        { c: "#d35400", r: 1, v: 1 } // Burnt Orange accent
    ],
    manueline: [ // Nautical and discovery age
        { c: "#1b4f72", r: 4 }, // Cobalt
        { c: "#d4ac0d", r: 3 }, // Gold
        { c: "#e5e8e8", r: 3 }, // Mist
        { c: "#2c3e50", r: 2 }, // Slate
        { c: "#fdfefe", r: 1, v: 1 } // Salt/White accent
    ],
    murex: [  // royal sea snail — crimson + midnight deep
        { c: "#b02040", r: 3 },       // wine
        { c: "#c82828", r: 2 },       // vermillion
        { c: "#101840", r: 3 },       // midnight blue
        { c: "#505878", r: 2 },       // slate
        { c: "#c8a060", r: 1, v: 1 }, // gold accent
        { c: "#480810", r: 3 },       // near-black crimson
        { c: "#201810", r: 2 }        // deep dark
    ],
    kelme: [  // ink + parchment — the catalog page itself
        { c: "#303028", r: 3 },       // dark ink
        { c: "#585048", r: 2 },       // warm gray
        { c: "#f8e8d0", r: 3 },       // light parchment
        { c: "#c0b890", r: 2 },       // warm sage
        { c: "#c82828", r: 1, v: 1 }, // red accent
        { c: "#908878", r: 2 },       // mid gray
        { c: "#201810", r: 2 }        // near-black
    ],
    viride: [  // green earth — forest dye from the color plates
        { c: "#306038", r: 3 },       // forest green
        { c: "#686858", r: 2 },       // olive gray
        { c: "#886830", r: 2 },       // golden brown
        { c: "#a0a088", r: 2 },       // sage
        { c: "#f05858", r: 1, v: 1 }, // coral accent
        { c: "#584020", r: 2 },       // umber
        { c: "#201810", r: 3 }        // deep dark
    ],
    kokkos: [  // scarlet worm — kermes insect dye (Greek: kokkos)
        { c: "#f83038", r: 3 },       // bright scarlet
        { c: "#f05858", r: 2 },       // coral
        { c: "#b02040", r: 2 },       // wine
        { c: "#d89890", r: 1 },       // dusty rose
        { c: "#c8a060", r: 1, v: 1 }, // gold accent
        { c: "#883028", r: 2 },       // dark sienna
        { c: "#303028", r: 3 }        // dark
    ],
    shahar: [  // dawn (Hebrew) — Salmon dominant
        { c: "#f38e82", r: 3 },       // salmon
        { c: "#e9967a", r: 2 },       // dark salmon
        { c: "#f5e6d3", r: 2 },       // cream
        { c: "#d89890", r: 2 },       // dusty rose
        { c: "#45b698", r: 1, v: 1 }, // teal accent
        { c: "#883028", r: 2 },       // sienna
        { c: "#303028", r: 3 }        // dark
    ],
    gehelet: [  // ember (Hebrew) — Burnt Umber dominant
        { c: "#8a3324", r: 3 },       // burnt umber
        { c: "#5c3a2e", r: 2 },       // dark brown
        { c: "#c58b5b", r: 2 },       // golden brown
        { c: "#a8613f", r: 2 },       // rust
        { c: "#f2c28a", r: 1, v: 1 }, // gold accent
        { c: "#4a2f23", r: 2 },       // deep brown
        { c: "#201810", r: 3 }        // near-black
    ],
    tarshish: [  // beryl/sea-stone (Hebrew) — Aqua dominant
        { c: "#45b698", r: 3 },       // aqua / teal
        { c: "#20b2aa", r: 2 },       // light sea green
        { c: "#008080", r: 2 },       // teal
        { c: "#6c8a7a", r: 2 },       // sage
        { c: "#f05858", r: 1, v: 1 }, // coral accent
        { c: "#2f4f4f", r: 2 },       // dark slate
        { c: "#101820", r: 3 }        // dark
    ],

    // ── HyperLoom Origins palettes ──────────────────────────────────────────

    pepel: [  // ash (Erzya) — White Mono
        { c: "#F3F5F6", r: 2 },       // off-white
        { c: "#D8DCDF", r: 2 },       // very light gray
        { c: "#A7ADB2", r: 3 },       // light gray
        { c: "#6A7177", r: 2 },       // medium gray
        { c: "#353B41", r: 2 },       // dark gray
        { c: "#0F1316", r: 3 }        // near-black
    ],
    katan: [  // fine linen (Hebrew) — White on Cream
        { c: "#FAF8F3", r: 2 },       // pure cream
        { c: "#F3F5F6", r: 2 },       // off-white
        { c: "#D8DCDF", r: 2 },       // light gray
        { c: "#A7ADB2", r: 2 },       // medium gray
        { c: "#6A7177", r: 2 },       // steel
        { c: "#C6543F", r: 1, v: 1 }, // coral accent
        { c: "#0F1316", r: 3 }        // near-black
    ],

    // ── Japanese Dye palettes ───────────────────────────────────────────────

    aizome: [  // Indigo and Sashiko thread
        { c: "#0A1128", r: 4 },       // midnight indigo (kachiiro)
        { c: "#1F3B60", r: 3 },       // deep indigo (koki-hanada)
        { c: "#4B749F", r: 2 },       // medium indigo (hanada-iro)
        { c: "#8FAFC6", r: 2 },       // pale water blue (mizu-iro)
        { c: "#F8F4E6", r: 2 },       // unbleached thread / cream
        { c: "#B23A48", r: 1, v: 1 }, // tiny modern red accent
        { c: "#101010", r: 2 }        // near black
    ],
    kakiishibu: [  // Persimmon tannin rusts
        { c: "#D96C4A", r: 3 },       // raw persimmon (kakiishibu)
        { c: "#9B3D2B", r: 3 },       // rusted iron red (bengara)
        { c: "#5C2B22", r: 3 },       // dark russet brown
        { c: "#E5B98A", r: 2 },       // pale bamboo/tan (kusune)
        { c: "#2C3E50", r: 1, v: 1 }, // contrasting slate blue accent
        { c: "#181514", r: 2 }        // soft charcoal
    ],
    uguisu: [  // Nightingale green / tea moss
        { c: "#6A7B58", r: 3 },       // moss green (uguisu-iro)
        { c: "#425232", r: 3 },       // dark pine (matsuha-iro)
        { c: "#A3AC90", r: 2 },       // pale tea green (wakatake)
        { c: "#D4C7A5", r: 2 },       // straw/hemp
        { c: "#C9814D", r: 1, v: 1 }, // fox brown / kitsune accent
        { c: "#1A1B16", r: 2 }        // dark forest black
    ],
    sumi: [  // Sumi-e ink / charcoal wash
        { c: "#111111", r: 4 },       // jet black (sumi)
        { c: "#fcfcfa", r: 3 },       // pure white (washi paper)
        { c: "#3c3d38", r: 2 },       // dark charcoal
        { c: "#8fa3a3", r: 2 },       // pale silver-grey wash
        { c: "#bf2b2b", r: 1, v: 1 }, // vermilion chop/seal accent (shu)
        { c: "#080808", r: 2 }        // deep void black
    ],
    sakura: [  // Cherry blossom pinks
        { c: "#f7e1e6", r: 4 },       // pale cherry blossom (sakura-iro)
        { c: "#d4758b", r: 3 },       // deep pink (tsutsuji-iro)
        { c: "#a32136", r: 2 },       // dark crimson (kurenai)
        { c: "#faf5eb", r: 2 },       // soft cream (kinari)
        { c: "#3d4c53", r: 1, v: 1 }, // slate blue branch accent
        { c: "#241e1f", r: 2 }        // soft black
    ],
    matcha: [  // Ceremonial tea greens
        { c: "#b4c56c", r: 4 },       // bright tea green (matcha)
        { c: "#73863d", r: 3 },       // dark olive (matsuha)
        { c: "#e6e0cc", r: 2 },       // ceramic cream
        { c: "#5a4b3c", r: 2 },       // dark tea brown (cha-kasshoku)
        { c: "#c56847", r: 1, v: 1 }, // burnt orange ceramic accent
        { c: "#1b1916", r: 2 }        // deep black
    ],
    kinpak: [  // Gold leaf screen (kinpaku)
        { c: "#e8c351", r: 4 },       // gold leaf (kin-iro)
        { c: "#1a1818", r: 4 },       // stark black lacquer
        { c: "#d9972b", r: 2 },       // deep ochre / rich gold
        { c: "#f7f1e6", r: 1 },       // pale un-dyed silk
        { c: "#9b1e22", r: 1, v: 1 }, // dark vermilion accent
        { c: "#0b0a0a", r: 2 }        // darkest void
    ],
    savonnerie: [ // Dense French Carpets
        { c: "#1C244B", r: 4 },       // deep rich indigo/navy
        { c: "#D4AF37", r: 3 },       // metallic/ochre gold
        { c: "#8B1E28", r: 3 },       // dark crimson/madder
        { c: "#E2B8BB", r: 2 },       // soft dusty pink
        { c: "#425243", r: 2 },       // dark foliage green
        { c: "#F3EBDD", r: 2 },       // antique cream/ivory
        { c: "#141212", r: 3 }        // deep structural black
    ],
    stolz: [ // Gunta Stolzl Bauhaus Samplers
        { c: "#1A4974", r: 4 },       // marine blue
        { c: "#DD485A", r: 3 },       // bauhaus red/pink
        { c: "#DBAD41", r: 3 },       // ochre
        { c: "#1B8270", r: 2 },       // teal/green
        { c: "#9569AC", r: 2 },       // muted lavender
        { c: "#EBE3D6", r: 3 },       // bright woven white
        { c: "#17181A", r: 4 }        // structural black
    ],

    // ── Global Textiles ─────────────────────────────────────────────────────

    wari: [  // Andean patchwork (Peru)
        { c: "#102848", r: 3 },       // indigo/navy background
        { c: "#883028", r: 3 },       // rust/terracotta red
        { c: "#606838", r: 2 },       // olive/moss green
        { c: "#D8B048", r: 2 },       // golden/ochre yellow
        { c: "#E8D8B8", r: 1 },       // off-white/cream
        { c: "#B84830", r: 1, v: 1 }, // brighter brick red
        { c: "#201818", r: 2 }        // near black
    ],
    navajo: [  // Southwestern rug bands
        { c: "#101838", r: 3 },       // deep midnight navy
        { c: "#A01820", r: 3 },       // madder red / cardinal
        { c: "#C8A880", r: 2 },       // sand/tan
        { c: "#F0E8D8", r: 1 },       // pale gray/white
        { c: "#B03038", r: 1, v: 1 }, // brick accent
        { c: "#282828", r: 3 }        // charcoal/black
    ],
    ganado: [  // Classic Navajo Ganado Red
        { c: "#9b1e22", r: 4 },       // Ganado Red (cochineal/aniline)
        { c: "#1a1818", r: 3 },       // Deep black wool
        { c: "#f6f1ec", r: 2 },       // Pure white wool
        { c: "#87827e", r: 2 },       // Carded grey
        { c: "#631c19", r: 1, v: 1 }, // Dark oxidized red accent
        { c: "#111111", r: 2 }        // Absolute black
    ],
    moki: [  // Navajo Classic Phase Chief's Blanket
        { c: "#0c152d", r: 4 },       // Deep indigo blue
        { c: "#221c18", r: 3 },       // Dark brown/black striping
        { c: "#f0ece1", r: 2 },       // Crisp white
        { c: "#a32128", r: 1 },       // Sparse Bayeta red
        { c: "#c7ac83", r: 1, v: 1 }, // Un-dyed tan accent
        { c: "#080b12", r: 2 }        // Midnight border
    ],
    kagetoh: [  // Navajo Transitional Eye-Dazzler
        { c: "#bd2b2b", r: 3 },       // Intense bright red
        { c: "#dca738", r: 3 },       // Squash blossom yellow/gold
        { c: "#d46b33", r: 2 },       // Warm orange/tan
        { c: "#1b191a", r: 3 },       // Stark black contrast
        { c: "#f4f0e6", r: 1, v: 1 }, // Cream border/outline
        { c: "#111010", r: 2 }        // Deepest black
    ],
    two_grey_hills: [  // Navajo Classic Natural Wools
        { c: "#111111", r: 4 },       // Deep jet black (natural/overdyed)
        { c: "#483c32", r: 3 },       // Warm taupe / carded brown
        { c: "#73695e", r: 3 },       // Heathered grey
        { c: "#fcf9f2", r: 2 },       // Un-dyed natural white
        { c: "#302621", r: 1, v: 1 }, // Deepest dark brown accent
        { c: "#0a0a0a", r: 2 }        // Stark black void
    ],
    teec_nos_pos: [    // High-Energy Aniline Teec Nos Pos
        { c: "#d13813", r: 3 },       // Intense deep orange / red
        { c: "#118f50", r: 2 },       // Vivid emerald green
        { c: "#c71221", r: 2 },       // Bright cardinal red
        { c: "#f5b720", r: 2 },       // Bright marigold gold
        { c: "#f0efe9", r: 1, v: 1 }, // Stark white contrast
        { c: "#080707", r: 4 }        // Dominant black outlining
    ],
    burntwater: [      // Distinctive Vegetal Dyes - Earthy
        { c: "#943c22", r: 3 },       // Deep rust / burnt orange
        { c: "#ba6625", r: 3 },       // Amber / ochre
        { c: "#693618", r: 2 },       // Woody brown / terracotta
        { c: "#b39e86", r: 2 },       // Carded tan / sand
        { c: "#c24727", r: 1, v: 1 }, // Brighter rust accent
        { c: "#1a1310", r: 2 }        // Deepest warm brown
    ],
    chinle: [          // High Desert Pastels (Soft Vegetal)
        { c: "#d48d7c", r: 3 },       // Pale salmon pink / clay
        { c: "#d1b46b", r: 2 },       // Muted mustard / desert gold
        { c: "#879172", r: 2 },       // Soft sage green
        { c: "#d9d0c1", r: 3 },       // Warm desert sand / beige
        { c: "#ba6f59", r: 1, v: 1 }, // Deeper clay red accent
        { c: "#2e2925", r: 1 }        // Soft charcoal outline
    ],
    crystal: [         // Vegetal Forest Tones
        { c: "#425232", r: 3 },       // Deep olive green
        { c: "#59422f", r: 3 },       // Rich walnut brown
        { c: "#a38241", r: 2 },       // Soft muted gold / mustard
        { c: "#dbd5cc", r: 2 },       // Natural white
        { c: "#2e3b21", r: 1, v: 1 }, // Darkest forest green accent
        { c: "#1a1614", r: 1 }        // Very dark brown
    ],
    tsemer: [  // soft wool (Hebrew) — Sorbet Grid
        { c: "#FFE7E0", r: 2 },       // peach
        { c: "#FFD6A8", r: 2 },       // apricot
        { c: "#FFF0B6", r: 2 },       // light yellow
        { c: "#D6F0BA", r: 2 },       // light green
        { c: "#E7F5BE", r: 2 },       // mint cream
        { c: "#F2E8C6", r: 2 },       // cream
        { c: "#F9B1C8", r: 1 },       // pink
        { c: "#F4836A", r: 1, v: 1 }, // coral accent
        { c: "#6E7C8F", r: 2 },       // slate
        { c: "#201F25", r: 3 }        // dark
    ],
    porphyra: [  // purple-shell (Greek) — Shell and Coral
        { c: "#F8F4ED", r: 2 },       // very light shell
        { c: "#F2EFEA", r: 2 },       // shell
        { c: "#B8B8B9", r: 2 },       // light gray
        { c: "#FA9A86", r: 1 },       // coral pink
        { c: "#E56459", r: 1, v: 1 }, // coral red accent
        { c: "#C84C7A", r: 1 },       // pink
        { c: "#C8B779", r: 1 },       // tan
        { c: "#6E6E71", r: 2 },       // medium gray
        { c: "#3A3A3C", r: 2 },       // dark gray
        { c: "#171718", r: 3 }        // near-black
    ],
    kaspi: [  // silver (Erzya) — Slate Fog
        { c: "#EAEDEF", r: 2 },       // off-white
        { c: "#C6CCD1", r: 2 },       // light gray
        { c: "#98A1A8", r: 2 },       // cool gray
        { c: "#6D7880", r: 2 },       // medium
        { c: "#49545B", r: 2 },       // dark medium
        { c: "#F2C14E", r: 1, v: 1 }, // yellow accent
        { c: "#D96B5F", r: 1 },       // coral
        { c: "#2E363B", r: 2 },       // charcoal
        { c: "#1F2529", r: 2 },       // dark
        { c: "#111416", r: 3 }        // near-black
    ],
    tukmo: [  // brick/earthen (Erzya) — Baked
        { c: "#F8E3C4", r: 1 },       // cream
        { c: "#F2C28A", r: 2 },       // sand
        { c: "#E89A5C", r: 2 },       // light terracotta
        { c: "#CF7B4A", r: 3 },       // terracotta
        { c: "#A8613F", r: 2 },       // rust
        { c: "#7A4A33", r: 2 },       // brown
        { c: "#6C8A7A", r: 1, v: 1 }, // sage accent
        { c: "#3F5C57", r: 1 },       // dark teal
        { c: "#4A2F23", r: 2 },       // dark brown
        { c: "#2A1C17", r: 3 }        // near-black
    ],
    barzel: [  // iron (Hebrew) — Politique
        { c: "#F3F5F6", r: 1 },       // off-white
        { c: "#D4D8DC", r: 2 },       // light gray
        { c: "#9AA2AA", r: 2 },       // cool gray
        { c: "#6E7882", r: 2 },       // medium
        { c: "#4B555F", r: 2 },       // dark medium
        { c: "#CE3E3E", r: 1, v: 1 }, // red accent
        { c: "#A46F38", r: 1 },       // ochre
        { c: "#2F363D", r: 2 },       // charcoal
        { c: "#1E2126", r: 2 },       // dark
        { c: "#121417", r: 3 }        // near-black
    ],
    adama: [  // earth/ground (Hebrew) — Southwest
        { c: "#F5E6D3", r: 1 },       // cream
        { c: "#E8C4B0", r: 2 },       // sand
        { c: "#D4A58F", r: 2 },       // dusty rose
        { c: "#B87A65", r: 2 },       // terra
        { c: "#8B5A47", r: 3 },       // brown
        { c: "#C58B5B", r: 1 },       // golden brown
        { c: "#A86B3D", r: 1 },       // rust
        { c: "#6B8E7A", r: 1, v: 1 }, // sage accent
        { c: "#4A7C6B", r: 1 },       // teal
        { c: "#5C3A2E", r: 2 },       // dark
        { c: "#2A1F1A", r: 3 }        // near-black
    ],
    shemen: [  // olive oil (Hebrew) — Alentejo
        { c: "#F0EAD6", r: 2 },       // warm cream
        { c: "#F2E394", r: 2 },       // golden yellow
        { c: "#D3B99A", r: 2 },       // sand
        { c: "#C1D37F", r: 2 },       // spring green
        { c: "#A57C58", r: 2 },       // earth
        { c: "#708238", r: 2, v: 1 }, // olive accent
        { c: "#6C4E3C", r: 2 },       // dark brown
        { c: "#3E2F23", r: 3 }        // near-black
    ],
    yam: [  // sea (Hebrew) — St. Croix
        { c: "#FEDBDD", r: 2 },       // light pink
        { c: "#F9BCB8", r: 3 },       // salmon
        { c: "#45B698", r: 2, v: 1 }, // teal accent
        { c: "#848582", r: 2 },       // gray
        { c: "#010650", r: 3 }        // deep navy
    ],
    erev: [  // evening (Hebrew) — Monterey Drive
        { c: "#F4E1D2", r: 1 },       // cream
        { c: "#D9B382", r: 2 },       // sand
        { c: "#A7C6ED", r: 2 },       // sky blue
        { c: "#5386A6", r: 2 },       // ocean
        { c: "#7E5A9B", r: 2 },       // purple
        { c: "#E63946", r: 1, v: 1 }, // red accent
        { c: "#F28F3B", r: 1 },       // orange
        { c: "#2A2D34", r: 3 }        // dark
    ],
    alon: [  // oak (Hebrew) — Monticello
        { c: "#F8F4E3", r: 1 },       // cream
        { c: "#DCC48E", r: 2 },       // golden
        { c: "#A58F6F", r: 3 },       // warm brown
        { c: "#7DA5B3", r: 2 },       // blue-gray
        { c: "#4B6C70", r: 2 },       // teal
        { c: "#B3595C", r: 1, v: 1 }, // brick red accent
        { c: "#6C584C", r: 2 },       // dark brown
        { c: "#3A2F2C", r: 3 }        // near-black
    ],
    afarsek: [  // peach (Hebrew) — Peachtree
        { c: "#FFE5D4", r: 1 },       // lightest peach
        { c: "#FFB692", r: 2 },       // peach
        { c: "#A3C4BC", r: 2 },       // sage
        { c: "#F9D949", r: 1 },       // yellow
        { c: "#FF7F51", r: 2 },       // orange
        { c: "#6A8D73", r: 2 },       // forest
        { c: "#E63946", r: 1, v: 1 }, // red accent
        { c: "#3E3E3E", r: 3 }        // dark
    ],
    shoshan: [  // lily/rose (Hebrew) — Dogwood Bloom
        { c: "#FFF0F5", r: 1 },       // lavender blush
        { c: "#F9C6C9", r: 2 },       // light pink
        { c: "#C6E2FF", r: 2 },       // light blue
        { c: "#E69FAF", r: 2 },       // pink
        { c: "#D86C82", r: 2 },       // rose
        { c: "#A65D7B", r: 2 },       // mauve
        { c: "#7E4A5E", r: 2, v: 1 }, // dark mauve accent
        { c: "#4C516D", r: 3 }        // slate
    ],
    neshef: [  // twilight (Hebrew) — Baja Sur
        { c: "#FFFCF2", r: 1 },       // near-white
        { c: "#FFE6A7", r: 2 },       // light gold
        { c: "#FFB857", r: 2 },       // amber
        { c: "#F27649", r: 2 },       // orange
        { c: "#D94F3D", r: 2 },       // red
        { c: "#1B998B", r: 1, v: 1 }, // teal accent
        { c: "#6A0572", r: 2 },       // deep purple
        { c: "#2D3047", r: 3 }        // dark
    ],
    bahir: [  // luminous (Hebrew) — Miracle Mile
        { c: "#F3E9D2", r: 1 },       // cream
        { c: "#FFB400", r: 1 },       // gold
        { c: "#FF9F1C", r: 1 },       // amber
        { c: "#C7F464", r: 1 },       // lime
        { c: "#4ECDC4", r: 2 },       // teal
        { c: "#FF6B6B", r: 1, v: 1 }, // coral accent
        { c: "#556270", r: 2 },       // slate
        { c: "#2A2A2A", r: 3 }        // dark
    ],
    gan: [  // garden (Hebrew) — Belvedere Park
        { c: "#E9F1E9", r: 1 },       // pale green
        { c: "#F4E1D2", r: 1 },       // cream
        { c: "#D9E4DD", r: 2 },       // soft sage
        { c: "#A7C4A0", r: 2 },       // green
        { c: "#8C7A66", r: 2 },       // warm gray
        { c: "#5C8D62", r: 2, v: 1 }, // forest accent
        { c: "#3A5F3B", r: 2 },       // dark green
        { c: "#2E2E2E", r: 3 }        // dark
    ],
    zahav: [  // gold (Hebrew) — Luxe
        { c: "#F1FAEE", r: 1 },       // near-white
        { c: "#FFD166", r: 2 },       // gold
        { c: "#F4A261", r: 2 },       // apricot
        { c: "#4ECDC4", r: 2 },       // teal
        { c: "#06FFA5", r: 1, v: 1 }, // neon green accent
        { c: "#2A9D8F", r: 2 },       // dark teal
        { c: "#FF6B57", r: 1 },       // coral
        { c: "#5B85AA", r: 2 },       // steel blue
        { c: "#E63946", r: 1 },       // red
        { c: "#264653", r: 3 }        // dark teal
    ],
    simcha: [  // joy/festival (Hebrew) — Happy Socks
        { c: "#F6F3E8", r: 1 },       // warm white
        { c: "#E8E2CF", r: 2 },       // cream
        { c: "#86AB2E", r: 2 },       // lime green
        { c: "#F05A28", r: 2 },       // orange
        { c: "#F0CA00", r: 2, v: 1 }, // yellow accent
        { c: "#53B36A", r: 2 },       // green
        { c: "#ED6BA7", r: 1 },       // pink
        { c: "#C36B4C", r: 2 },       // brown
        { c: "#603F3A", r: 2 },       // dark brown
        { c: "#121212", r: 3 }        // near-black
    ],
    ruach: [  // wind/spirit (Hebrew) — Bay City Breeze
        { c: "#87CEEB", r: 3 },       // sky blue
        { c: "#FFE4B5", r: 2 },       // moccasin
        { c: "#98D8C8", r: 2 },       // mint
        { c: "#F7DC6F", r: 2 },       // yellow
        { c: "#4FC3F7", r: 2 },       // light blue
        { c: "#FF69B4", r: 1, v: 1 }, // hot pink accent
        { c: "#BB8FCE", r: 2 },       // lavender
        { c: "#F8BBD0", r: 2 }        // light pink
    ],
    nana: [  // mint (Hebrew/Arabic) — Mint (Genesis)
        { c: "#E0F5E0", r: 2 },       // lightest mint
        { c: "#B8E8C8", r: 3 },       // mint green
        { c: "#90D8B0", r: 2 },       // medium mint
        { c: "#60C890", r: 2 },       // green
        { c: "#F0E880", r: 1, v: 1 }, // yellow accent
        { c: "#C8E0A0", r: 2 },       // lime
        { c: "#387050", r: 2 },       // dark green
        { c: "#203828", r: 3 }        // near-black
    ],

    // ── Japanese Traditional Palettes ─────────────────────────────────────────

    kinjiki: [  // Imperial Reds & Purples (Forbidden Colors)
        { c: "#FF4E20", r: 1 },       // Otan / Orange
        { c: "#C91F37", r: 2 },       // Karakurenai / Crimson
        { c: "#7E2639", r: 1 },       // Su'o / Sappanwood
        { c: "#2B2028", r: 3 },       // Shikon / Blue-violet
        { c: "#5D3F6A", r: 4 },       // Kikyo / Bellflower (Boosted)
        { c: "#DB5A6B", r: 1, v: 1 }, // Kobai / Red plum accent
        { c: "#F5E6D3", r: 1 }        // Cream contrast
    ],
    stars_and_stripes: [
        { c: "#002868", r: 1 },       // Old Glory Blue
        { c: "#FFFFFF", r: 1 },       // White
        { c: "#BF0A30", r: 1.5 }      // Old Glory Red (Stripes)
    ],
    shibui: [  // Earthy & Astringent (Permissible Colors)
        { c: "#162B2E", r: 3 },       // Deeper Ai-iro
        { c: "#656255", r: 2 },       // Rikyu-nezumi
        { c: "#C14B38", r: 2 },       // Brighter Edocha
        { c: "#593A27", r: 2 },       // Susutake
        { c: "#A59445", r: 1 },       // Brightened Koke accent
        { c: "#D1C0B5", r: 2 },       // Brighter Shironezumi
        { c: "#FFFFFF", r: 1, v: 1 }  // Pure White Pop
    ],
    seigaiha: [  // The Sea & Waves
        { c: "#003171", r: 3 },       // Konjo / Prussian blue
        { c: "#1B294B", r: 3 },       // Rurikon / Lapis dark blue
        { c: "#48929B", r: 2 },       // Asagi / Light blue
        { c: "#5D8CAE", r: 2 },       // Gunjo / Ultramarine
        { c: "#A5BA93", r: 1 },       // Byakuroku / Whitish green accent
        { c: "#FFDDCA", r: 1 },       // Shironeri / Unbleached silk
        { c: "#FFFFFF", r: 1, v: 1 }  // Pure White (Platen foam accent)
    ],
    ukiyoe: [  // Hokusai / Hiroshige Prints
        { c: "#1B477D", r: 3 },       // Prussian Blue
        { c: "#4789B3", r: 2 },       // Sky Blue
        { c: "#D93611", r: 2 },       // Vermillion
        { c: "#F2C029", r: 2 },       // Turmeric Yellow
        { c: "#3C5940", r: 1 },       // Deep Pine Green
        { c: "#EAD9C2", r: 1 },       // Aged Washi Paper
        { c: "#FFFFFF", r: 1, v: 1 }  // Bright Foam
    ],
    primaries: [ // Red, Yellow, Blue, and Black only (Pure Primary Stark)
        { c: "#DA0301", r: 3 },       // intense red
        { c: "#F6B52E", r: 3 },       // worker yellow
        { c: "#214F8E", r: 3 },       // deep blue
        { c: "#000000", r: 4 }        // pure black
    ],
    kabuki: [  // Dramatic Stage Craft
        { c: "#0D0D0D", r: 4 },       // Ink Black
        { c: "#D91A1A", r: 3 },       // Kumadori Red
        { c: "#F2F2F2", r: 2 },       // Rice Powder White
        { c: "#BF9B30", r: 2 },       // Stage Gold
        { c: "#591E1E", r: 1 }        // Dried Blood
    ],
    matsuri: [  // Festive Night Market
        { c: "#F26B1D", r: 3 },       // Chochin Lantern Orange
        { c: "#591A4D", r: 3 },       // Night Purple
        { c: "#0D8C8C", r: 2 },       // Festival Teal
        { c: "#F2A71B", r: 2 },       // Street Food Gold
        { c: "#F291AD", r: 1, v: 1 }  // Cherry Blossom Pop
    ],

    // ── African Textiles ──────────────────────────────────────────────────────

    bogolan: [  // Bamana Mudcloth
        { c: "#272013", r: 3 },       // Dark Mud
        { c: "#a9a599", r: 2 },       // Bleached Cotton
        { c: "#8c7c57", r: 2 },       // Ochre Mud
        { c: "#4b3f23", r: 2 },       // Wet Earth
        { c: "#392f1b", r: 3 }        // Deep Brown
    ],
    adire: [  // Yoruba Indigo Resist Dye
        { c: "#1b1c1d", r: 3 },       // Deep Indigo Black
        { c: "#333f44", r: 3 },       // Dark Slate Blue
        { c: "#4a5b61", r: 2 },       // Faded Indigo
        { c: "#6f7471", r: 2 },       // Greyed Blue
        { c: "#928d82", r: 1, v: 1 }  // White Resist Dye Accent
    ],
    kuba: [  // Ngongo Raffia
        { c: "#aaa59d", r: 2 },       // Natural Light Raffia
        { c: "#816a5b", r: 2 },       // Warm Woven Tan
        { c: "#713417", r: 2 },       // Terracotta Dye
        { c: "#502716", r: 2 },       // Russet Brown
        { c: "#311a12", r: 3 }        // Dark Woven Brown
    ],
    kente: [  // Asante / Ewe Woven Colors
        { c: "#272018", r: 3 },       // Dark Woven Bark
        { c: "#a29a8b", r: 2 },       // Light Woven Thread
        { c: "#8b4513", r: 2, v: 1 }, // Vibrant Rust/Ochre Accent
        { c: "#683c1c", r: 2 },       // Warm Earth Red
        { c: "#4b351b", r: 2 }        // Deep Brown
    ],
    suprematism: [  // Malevich / Suprematism (Red, Black, White, Yellow)
        { c: "#C21E17", r: 4 },       // cadmium red
        { c: "#1B1918", r: 4 },       // soot black
        { c: "#F2F2F2", r: 3 },       // aged white
        { c: "#F2C029", r: 2 },       // golden yellow
        { c: "#6F6C6A", r: 2 },       // concrete gray
        { c: "#1B1918", r: 2, v: 1 }  // black accent
    ],
    rodchenko: [  // Rodchenko / Constructivism (Red, Yellow, Black)
        { c: "#D91A1A", r: 4 },       // constructivist red
        { c: "#F2B705", r: 3 },       // worker yellow
        { c: "#262626", r: 4 },       // industrial black
        { c: "#F2F2F2", r: 2 },       // paper white
        { c: "#D91A1A", r: 1, v: 1 }  // red pop
    ],
    lissitzky: [  // El Lissitzky / PROUN (Black, White, Gray, Red)
        { c: "#1B1918", r: 5 },       // dominant black
        { c: "#EBEBEB", r: 4 },       // paper gray-white
        { c: "#A7A8A9", r: 3 },       // architectural gray
        { c: "#C21E17", r: 2 },       // signal red
        { c: "#F2F2F2", r: 1, v: 1 }  // white highlight
    ],
    structural: [ // Architectural / Constructivist — extracted from provided images
        { c: "#da0301", r: 3 },       // intense red
        { c: "#f6b52e", r: 2 },       // worker yellow
        { c: "#167540", r: 2 },       // forest green
        { c: "#214f8e", r: 3 },       // deep architectural blue
        { c: "#ef9ca4", r: 2 },       // soft architectural pink
        { c: "#ede7e4", r: 2 },       // parchment / white
        { c: "#292120", r: 3 },       // structural charcoal / black
        { c: "#71544d", r: 1, v: 1 }  // sienna / rust accent
    ],
    orak: [ // Cosmic Surrealist - Sun, Deep Space, and Celestial Rays
        { c: "#FFD700", r: 3 },       // sun yellow
        { c: "#FF8C00", r: 2 },       // cosmic orange
        { c: "#4B0082", r: 2 },       // deep violet
        { c: "#C21E17", r: 2 },       // indian red
        { c: "#6B4423", r: 2 },       // earth brown
        { c: "#FFFFFF", r: 1, v: 1 }, // bright white pop
        { c: "#08090A", r: 4 }        // void black
    ],
    glitch_acid: [ // High-contrast Cyberpunk Glitch
        { c: "#00FF00", r: 3 },       // lime green
        { c: "#FF00FF", r: 2 },       // magenta
        { c: "#00FFFF", r: 2 },       // cyan
        { c: "#FFFFFF", r: 1, v: 1 }, // white flash
        { c: "#000000", r: 5 }        // black depth
    ],
    concrete: [ // Brutalist concrete & rust
        { c: "#808080", r: 4 },       // medium gray
        { c: "#A0A0A0", r: 3 },       // light gray
        { c: "#606060", r: 3 },       // dark gray
        { c: "#8B4513", r: 2 },       // saddle brown (rust)
        { c: "#D2B48C", r: 1, v: 1 }, // tan accent
        { c: "#404040", r: 5 }        // near black
    ],
    blueprint_cyan: [ // Deep blue blueprint
        { c: "#000080", r: 5 },       // navy blue base
        { c: "#0000FF", r: 3 },       // royal blue
        { c: "#00FFFF", r: 2 },       // cyan line
        { c: "#FFFFFF", r: 1, v: 1 }, // white notation
        { c: "#191970", r: 4 }        // midnight
    ],
    cyber_mesh: [ // Industrial cyberpunk
        { c: "#FFFF00", r: 3 },       // electric yellow
        { c: "#32CD32", r: 2 },       // lime green
        { c: "#1A1A1A", r: 5 },       // dark synthetic
        { c: "#FF8C00", r: 2 },       // dark orange
        { c: "#00FF00", r: 1, v: 1 }, // neon green flash
        { c: "#000000", r: 4 }        // void
    ],
    suprematism: [ // Malevich / Suprematist 1915
        { c: "#FF0000", r: 3 },       // red square
        { c: "#FFD700", r: 2 },       // yellow field
        { c: "#0000FF", r: 2 },       // blue beam
        { c: "#FFFFFF", r: 1, v: 1 }, // white void
        { c: "#000000", r: 5 }        // black cross
    ],
    glitch_heat: [ // Thermal Camera Glitch
        { c: "#FF4500", r: 4 },       // orangered
        { c: "#FFD700", r: 2 },       // gold
        { c: "#8B008B", r: 2 },       // dark magenta
        { c: "#4B0082", r: 2 },       // deep indigo
        { c: "#000000", r: 4 }        // shadow
    ],
    cherokee: [ // Tsalagi Natural Dyes
        { c: "#4B3621", r: 3 },       // walnut brown
        { c: "#8E2323", r: 2 },       // bloodroot red
        { c: "#C5A14F", r: 2 },       // yellow dock
        { c: "#1A1A1A", r: 2 },       // river cane black
        { c: "#A0522D", r: 3 }        // sienna clay
    ],
    glitch_void: [ // Retro Hardware Error
        { c: "#808080", r: 3 },       // console gray
        { c: "#FF0000", r: 2 },       // alert red
        { c: "#00008B", r: 2 },       // kernel blue
        { c: "#08090A", r: 5 }        // void black
    ],
    mondrian: [ // Piet Mondrian / De Stijl
        { c: "#FF0000", r: 2 },       // primary red
        { c: "#0000FF", r: 1 },       // primary blue
        { c: "#FFFF00", r: 1 },       // primary yellow
        { c: "#F2F2F2", r: 5 },       // canvas white
        { c: "#1B1918", r: 4 }        // structural black
    ],
    shiprock: [ // Navajo Eye-Dazzler / High Contrast
        { c: "#990000", r: 4 },       // traditional red
        { c: "#F5F5F5", r: 3 },       // bright white
        { c: "#1A1A1A", r: 4 },       // carbon black
        { c: "#808080", r: 2 },       // smoke grey
        { c: "#E6D2B5", r: 2 }        // desert sand
    ],
    woodcut: [ // Raw Birch & Dark Walnut Stain
        { c: "#E6C9A8", r: 5 },       // raw birch
        { c: "#3D2717", r: 5 }        // dark walnut stain
    ],
    collage: [ // Textile Patchwork & Scraps
        { c: "#E6D2B5", r: 4 },       // linen base
        { c: "#B07060", r: 2 },       // terra cotta scrap
        { c: "#B5C948", r: 2 },       // lime green fabric
        { c: "#F07870", r: 2 },       // coral/pink accent
        { c: "#9080B0", r: 2 },       // lavender overlay
        { c: "#585048", r: 2 },       // olive/sage backing
        { c: "#201810", r: 3 }        // ink/thread black
    ],
    bleached: [ // Stark White / Titanium
        { c: "#FFFFFF", r: 6 },       // pure white
        { c: "#F8F8F8", r: 2 },       // off-white frost
        { c: "#F2F2F2", r: 2 }        // subtle grey tint
    ],
    flow: [  // Flow Field — warm cream background palette
        { c: "#F2ECE4", r: 1 },       // off-white cream
        { c: "#EEDFCC", r: 1 },       // warm cream
        { c: "#A8CED0", r: 2 },       // ice blue
        { c: "#4A7FB5", r: 3 },       // steel blue
        { c: "#152249", r: 2 },       // deep navy
        { c: "#2A9D8F", r: 3 },       // teal accent
        { c: "#F0B429", r: 3 },       // golden yellow
        { c: "#E04E39", r: 3 },       // warm red
        { c: "#F0A28C", r: 2 },       // salmon pink
        { c: "#E87D3E", r: 2 },       // orange
        { c: "#4A3728", r: 2 },       // chocolate brown
        { c: "#6B5B3E", r: 1 }        // olive brown
    ],
    flow_deep_cream: [
        { c: "#152249", r: 3 }, { c: "#2A9D8F", r: 3 }, { c: "#4A7FB5", r: 2 }, { c: "#A8CED0", r: 2 },
        { c: "#F0B429", r: 2 }, { c: "#E87D3E", r: 1 }, { c: "#E04E39", r: 1 }, { c: "#F0A28C", r: 1 },
        { c: "#4A3728", r: 2 }, { c: "#6B5B3E", r: 1 }, { c: "#F2ECE4", r: 1 }
    ],

    // ── Verena Loewensberg ─────────────────────────────────────────────────────

    "viana": ["#CD2836", "#CD2836", "#144893", "#E3B637", "#2C6D41", "#F1F0E6"], // Viana do Castelo
    "castelo_branco": ["#164E8C", "#2C753B", "#C0252D", "#C0252D", "#D8A334", "#B8558A"], // Castelo Branco embroidery
    "palestine_dawn": ["#E8D4D6", "#E8D4D6", "#FAD8C3", "#225946", "#8F2C3D", "#1D2D50"], // Tatreez - pale pink sky, deep green/red cypress
    "negev_gold": ["#D5A96E", "#D5A96E", "#D5A96E", "#1D6487", "#A42D26", "#61895B"], // Tatreez - desert sands, stark blues
    "bedouin_night": ["#5A1C2C", "#5A1C2C", "#00A1D1", "#D11786", "#FED700", "#4AB548", "#F25B20"], // Tatreez - electric primaries on burgundy
    "gaza_dusk": ["#F8DAB2", "#D22E30", "#871520", "#546A85", "#7EB294", "#EAD8CF"], // Tatreez - dense crimson gradient, slate/mint base
    "olive_grove": ["#F4922A", "#68A5D6", "#68A5D6", "#2D412C", "#3E5735", "#8E9E68"], // Tatreez - orange sun, blue sky, dark heavy greens
    oil_pastel: [ // Faber-Castell Oil Pastel Set
        { c: "#F9D949", r: 3 }, // 107 Cadmium Yellow
        { c: "#FF7F41", r: 3 }, // 113 Orange Glaze
        { c: "#E84E8D", r: 3 }, // 123 Fuchsia
        { c: "#604382", r: 3 }, // 138 Violet
        { c: "#2E5BB2", r: 3 }, // 143 Cobalt Blue
        { c: "#2E6C65", r: 1 }, // 158 Deep Cobalt Green
        { c: "#76C35F", r: 1 }, // 166 Grass Green
        { c: "#C36F5A", r: 2 }  // 188 Sanguine
    ],
    memphis: [  // Memphis Group (1980s postmodern — Sottsass, Mendini)
        { c: "#FFD93D", r: 3 },       // Memphis yellow (Sottsass sunshine)
        { c: "#E63946", r: 3 },       // Memphis red (laminate coral)
        { c: "#2EC4B6", r: 2 },       // Memphis teal (squiggle turquoise)
        { c: "#FF6B9D", r: 2 },       // Memphis pink (hot bubblegum)
        { c: "#7B2D8E", r: 2 },       // Memphis purple (lavender pop)
        { c: "#1A1A2E", r: 3 },       // Memphis midnight (dark ground)
        { c: "#44CF6C", r: 1, v: 1 }  // Memphis green (mint accent)
    ],
    miami_basel: [  // Art Basel Miami Beach 2026 — intentional maximalism
        { c: "#8FAE80", r: 3 },       // sage green (serenity anchor)
        { c: "#6B7B3A", r: 2 },       // olive green (organic calm)
        { c: "#C67B4F", r: 3 },       // terracotta (earthy warmth)
        { c: "#C8A86E", r: 2 },       // caramel (sandy neutral)
        { c: "#6B1D2A", r: 2 },       // barolo red (deep wine)
        { c: "#3A5E7A", r: 2 },       // smoky blue (ocean depth)
        { c: "#4A1E28", r: 2 },       // oxblood (dark accent)
        { c: "#F0E4D4", r: 1, v: 1 }  // raw plaster (light ground)
    ]
};


var PEN_MAP = {
    // Sakura Pigma Micron Accurate Palette
    "#18181A": "Pigma_Micron_Black",
    "#B82E2E": "Pigma_Micron_Red",
    "#2B4570": "Pigma_Micron_Blue",
    "#236B3B": "Pigma_Micron_Green",
    "#633924": "Pigma_Micron_Brown",
    "#5A3B73": "Pigma_Micron_Purple",
    "#3D2B24": "Pigma_Micron_Sepia",
    "#CF597E": "Pigma_Micron_Rose",
    "#6B1F2B": "Pigma_Micron_Burgundy",
    "#1A4731": "Pigma_Micron_Hunter_Green",
    "#1C2638": "Pigma_Micron_Blue_Black",
    "#1F5799": "Pigma_Micron_Royal_Blue",
    "#68A635": "Pigma_Micron_Fresh_Green",
    "#E06B1B": "Pigma_Micron_Orange",
    "#E8B723": "Pigma_Micron_Yellow",
    "#8C9196": "Pigma_Micron_Cool_Gray",
    "#BABBBC": "Pigma_Micron_Light_Cool_Gray",

    // Original Faber-Castell / Generic Mappings
    "#1D1D1D": "199 Black", "#7C2A24": "223 Dark Red",
    "#1B4D3E": "156 Cobalt Green", "#8D5B4C": "188 Sanguine",
    "#4E3629": "177 Walnut Brown",
    "#da0301": "121 Pale Geranium Lake", "#f6b52e": "109 Dark Chrome Yellow",
    "#167540": "161 Phthalo Green", "#214f8e": "247 Indanthrene Blue",
    "#FF0000": "121 Pale Geranium Lake", "#FFFF00": "107 Cadmium Yellow",
    "#F9D949": "107 Cadmium Yellow", "#FF7F41": "113 Orange Glaze",
    "#E46D86": "124 Rose Carmine", "#E84E8D": "123 Fuchsia",
    "#604382": "138 Violet", "#2E5BB2": "143 Cobalt Blue",
    "#2E6C65": "158 Deep Cobalt Green", "#76C35F": "166 Grass Green",
    "#E8AE4D": "183 Light Yellow Ochre", "#C36F5A": "188 Sanguine",
    "#0000FF": "247 Indanthrene Blue", "#000000": "199 Black",
    "#ef9ca4": "131 Coral", "#ede7e4": "103 Ivory",
    "#292120": "199 Black", "#71544d": "180 Raw Umber",
    "#FFD700": "107 Cadmium Yellow", "#FF8C00": "115 Orange Glaze",
    "#4B0082": "157 Dark Indigo", "#C21E17": "121 Pale Geranium Lake",
    "#6B4423": "177 Walnut Brown", "#08090A": "199 Black",
    "#00FF00": "171 Light Green", "#FF00FF": "128 Pink Carmine", "#00FFFF": "153 Cobalt Turquoise",
    "#FF4500": "115 Orange Glaze", "#8B008B": "136 Purple Violet", "#808080": "232 Cold Grey III",
    "#00008B": "247 Indanthrene Blue",
    "#008080": "153 Cobalt Turquoise", "#010650": "247 Indanthrene Blue", "#06FFA5": "174 Chromium Green Opaque",
    "#0F1316": "199 Black", "#101820": "161 Phthalo Green", "#101840": "247 Indanthrene Blue", "#111416": "199 Black",
    "#121212": "199 Black", "#121417": "199 Black", "#171718": "161 Phthalo Green", "#1B998B": "153 Cobalt Turquoise",
    "#1E2126": "175 Dark Sepia", "#1F2529": "175 Dark Sepia", "#201810": "175 Dark Sepia", "#201F25": "175 Dark Sepia",
    "#203828": "161 Phthalo Green", "#20B2AA": "153 Cobalt Turquoise", "#264653": "Micron Hunter Green",
    "#2A1C17": "175 Dark Sepia", "#2A1F1A": "175 Dark Sepia", "#2A2A2A": "175 Dark Sepia", "#2A2D34": "175 Dark Sepia",
    "#2A9D8F": "174 Chromium Green Opaque", "#2D3047": "175 Dark Sepia", "#2E2E2E": "175 Dark Sepia",
    "#2E363B": "175 Dark Sepia", "#2F363D": "175 Dark Sepia", "#2F4F4F": "Micron Hunter Green", "#303028": "175 Dark Sepia",
    "#306038": "Micron Hunter Green", "#353B41": "175 Dark Sepia", "#387050": "Micron Hunter Green",
    "#3A2F2C": "175 Dark Sepia", "#3A3A3C": "175 Dark Sepia", "#3A5F3B": "Micron Hunter Green", "#3E2F23": "175 Dark Sepia",
    "#3E3E3E": "177 Walnut Brown", "#3F5C57": "Micron Hunter Green", "#45B698": "174 Chromium Green Opaque",
    "#480810": "157 Dark Indigo", "#49545B": "Micron Hunter Green", "#4A2F23": "175 Dark Sepia",
    "#4A7C6B": "235 Cold Grey VI", "#4B555F": "235 Cold Grey VI", "#4B6C70": "235 Cold Grey VI",
    "#4C516D": "235 Cold Grey VI", "#4ECDC4": "146 Sky Blue", "#4FC3F7": "146 Sky Blue", "#505878": "235 Cold Grey VI",
    "#5386A6": "233 Cold Grey IV", "#53B36A": "174 Chromium Green Opaque", "#556270": "235 Cold Grey VI",
    "#584020": "177 Walnut Brown", "#585048": "177 Walnut Brown", "#5B85AA": "233 Cold Grey IV",
    "#5C3A2E": "177 Walnut Brown", "#5C8D62": "170 May Green", "#603F3A": "177 Walnut Brown",
    "#60C890": "174 Chromium Green Opaque", "#681818": "Micron Burgundy", "#686858": "235 Cold Grey VI",
    "#6A0572": "Micron Purple", "#6A7177": "235 Cold Grey VI", "#6A8D73": "233 Cold Grey IV", "#6B8E7A": "233 Cold Grey IV",
    "#6C4E3C": "177 Walnut Brown", "#6C584C": "235 Cold Grey VI", "#6C8A7A": "233 Cold Grey IV",
    "#6D7880": "233 Cold Grey IV", "#6E6E71": "235 Cold Grey VI", "#6E7882": "233 Cold Grey IV",
    "#6E7C8F": "233 Cold Grey IV", "#707088": "233 Cold Grey IV", "#708238": "167 Permanent Green Olive",
    "#7A4A33": "177 Walnut Brown", "#7DA5B3": "232 Cold Grey III", "#7E4A5E": "235 Cold Grey VI",
    "#7E5A9B": "233 Cold Grey IV", "#848582": "233 Cold Grey IV", "#86AB2E": "268 Green Gold",
    "#87CEEB": "146 Sky Blue", "#883028": "Micron Brown", "#886830": "180 Raw Umber", "#8890A0": "233 Cold Grey IV",
    "#8A3324": "Micron Brown", "#8B5A47": "180 Raw Umber", "#8C7A66": "180 Raw Umber", "#908878": "233 Cold Grey IV",
    "#90D8B0": "171 Light Green", "#98A1A8": "232 Cold Grey III", "#98D8C8": "146 Sky Blue", "#9AA2AA": "232 Cold Grey III",
    "#A0A088": "232 Cold Grey III", "#A3C4BC": "232 Cold Grey III", "#A46F38": "180 Raw Umber",
    "#A57C58": "180 Raw Umber", "#A58F6F": "180 Raw Umber", "#A65D7B": "180 Raw Umber", "#A7ADB2": "232 Cold Grey III",
    "#A7C4A0": "232 Cold Grey III", "#A7C6ED": "146 Sky Blue", "#A8613F": "180 Raw Umber", "#A86B3D": "180 Raw Umber",
    "#B02040": "134 Crimson", "#B07060": "180 Raw Umber", "#B3595C": "192 Indian Red", "#B84848": "192 Indian Red",
    "#B87A65": "192 Indian Red", "#B8B8B9": "232 Cold Grey III", "#B8E8C8": "272 Warm Grey III",
    "#BB8FCE": "125 Middle Purple Pink", "#C0B890": "232 Cold Grey III", "#C1D37F": "171 Light Green",
    "#C36B4C": "192 Indian Red", "#C58B5B": "186 Terracotta", "#C6543F": "192 Indian Red", "#C6CCD1": "272 Warm Grey III",
    "#C6E2FF": "154 Light Cobalt Turquoise", "#C7F464": "171 Light Green", "#C82828": "121 Pale Geranium Lake",
    "#C84C7A": "192 Indian Red", "#C8A060": "268 Green Gold", "#C8B779": "232 Cold Grey III",
    "#C8E0A0": "272 Warm Grey III", "#CE3E3E": "121 Pale Geranium Lake", "#CF7B4A": "186 Terracotta",
    "#D07870": "186 Terracotta", "#D3B99A": "232 Cold Grey III", "#D4A58F": "232 Cold Grey III",
    "#D4D8DC": "272 Warm Grey III", "#D6F0BA": "272 Warm Grey III", "#D86C82": "186 Terracotta",
    "#D89890": "232 Cold Grey III", "#D8DCDF": "272 Warm Grey III", "#D94F3D": "192 Indian Red",
    "#D96B5F": "186 Terracotta", "#D9B382": "232 Cold Grey III", "#D9E4DD": "272 Warm Grey III",
    "#DCC48E": "232 Cold Grey III", "#E0F5E0": "104 Light Yellow Glaze", "#E56459": "186 Terracotta",
    "#E63946": "121 Pale Geranium Lake", "#E69FAF": "Micron Rose", "#E7F5BE": "104 Light Yellow Glaze",
    "#E89A5C": "186 Terracotta", "#E8C4B0": "Micron Rose", "#E8E2CF": "272 Warm Grey III", "#E9967A": "186 Terracotta",
    "#E9F1E9": "103 Ivory", "#EAEDEF": "103 Ivory", "#ED6BA7": "127 Pink Carmine", "#F05858": "186 Terracotta",
    "#F05A28": "121 Pale Geranium Lake", "#F0B898": "Micron Rose", "#F0CA00": "109 Dark Chrome Yellow",
    "#F0E880": "104 Light Yellow Glaze", "#F0EAD6": "104 Light Yellow Glaze", "#F1FAEE": "103 Ivory",
    "#F27649": "186 Terracotta", "#F28F3B": "186 Terracotta", "#F2C14E": "268 Green Gold", "#F2C28A": "Micron Rose",
    "#F2E394": "Micron Rose", "#F2E8C6": "104 Light Yellow Glaze", "#F2EFEA": "103 Ivory", "#F38E82": "186 Terracotta",
    "#F3E9D2": "104 Light Yellow Glaze", "#F3F5F6": "103 Ivory", "#F4836A": "186 Terracotta", "#F4A261": "186 Terracotta",
    "#F4E1D2": "104 Light Yellow Glaze", "#F5E6D3": "104 Light Yellow Glaze", "#F6F3E8": "103 Ivory",
    "#F7DC6F": "268 Green Gold", "#F83038": "121 Pale Geranium Lake", "#F8BBD0": "Micron Rose", "#F8E0A0": "Micron Rose",
    "#F8E3C4": "104 Light Yellow Glaze", "#F8E8D0": "104 Light Yellow Glaze", "#F8F4E3": "104 Light Yellow Glaze",
    "#F8F4ED": "103 Ivory", "#F9B1C8": "Micron Rose", "#F9BCB8": "Micron Rose", "#F9C6C9": "Micron Rose",
    "#F9D949": "107 Cadmium Yellow", "#FA9A86": "186 Terracotta", "#FAF8F3": "103 Ivory", "#FEDBDD": "Micron Rose",
    "#FF69B4": "127 Pink Carmine", "#FF6B57": "186 Terracotta", "#FF6B6B": "186 Terracotta", "#FF7F51": "186 Terracotta",
    "#FF9F1C": "113 Orange Glaze", "#FFB400": "109 Dark Chrome Yellow", "#FFB692": "Micron Rose",
    "#FFB857": "186 Terracotta", "#FFD166": "268 Green Gold", "#FFD6A8": "Micron Rose",
    "#FFE4B5": "104 Light Yellow Glaze", "#FFE5D4": "104 Light Yellow Glaze", "#FFE6A7": "104 Light Yellow Glaze",
    "#FFE7E0": "104 Light Yellow Glaze", "#FFF0B6": "104 Light Yellow Glaze", "#FFF0F5": "103 Ivory",
    "#FFFCF2": "103 Ivory"
};

var SYMMETRY_OPTS = ['random', 'both', 'diagonal', 'glide', 'horizontal', 'kaleidoscope', 'none', 'quad', 'radial', 'rotational', 'vertical'];
var SPACE_OPTS = ['random', 'isometric', 'polar', 'hyperbolic', 'planar'];
var MOTIF_OPTS = ['random', 'typewriter', 'typewriter_quine', 'typewriter_classic', 'chopin', 'stars_and_stripes', 'tatreez', 'quatrefoil', 'ichthus', 'platen', 'square', 'viana_heart', 'typewriter_comma', 'typewriter_dot', 'typewriter_plus', 'typewriter_x', 'typewriter_asterisk', 'typewriter_slash', 'typewriter_dash'];
var CHROME_OPTS = ['random', 'typewriter_ribbon_multicolored', 'typewriter_black', 'typewriter_black_red', 'micron_plotter', 'stars_and_stripes', 'railyard', 'adama', 'adire', 'afarsek', 'aizome', 'alentejo', 'alon', 'argaman', 'azulejo_classico', 'bahir', 'barzel', 'bedouin_night', 'bleached', 'blueprint_cyan', 'bogolan', 'bricolage', 'burntwater', 'castelo_branco', 'cherokee', 'chinle', 'collage', 'concrete', 'crystal', 'cyber_mesh', 'erev', 'flow', 'flow_deep', 'gan', 'ganado', 'gaza_dusk', 'gehelet', 'glitch_acid', 'glitch_heat', 'glitch_void', 'kabuki', 'kagetoh', 'kakiishibu', 'karkom', 'kaspi', 'katan', 'kelme', 'kente', 'kinjiki', 'kinpak', 'kokkos', 'kuba', 'lissitzky', 'madder', 'manueline', 'matcha', 'matsuri', 'minho', 'moki', 'memphis', 'miami_basel', 'mondrian', 'murex', 'nana', 'navajo', 'negev_gold', 'neshef', 'oil_pastel', 'olive_grove', 'orak', 'palestine_dawn', 'panar', 'pepel', 'pombalino', 'porphyra', 'primaries', 'rodchenko', 'ruach', 'rutsya', 'sakura', 'savonnerie', 'seigaiha', 'shahar', 'shemen', 'shibui', 'shiprock', 'shoshan', 'simcha', 'sintra', 'spectrum', 'stolz', 'structural', 'sumi', 'suprematism', 'tarshish', 'teec_nos_pos', 'tekhelet', 'tukmo', 'two_grey_hills', 'uguisu', 'verena', 'viana', 'viride', 'wari', 'woodcut', 'yam', 'zahav'];
var ENGINE_OPTS = ['random', 'railyard', 'adama', 'adire', 'argyle', 'arraiolos', 'art_deco', 'asanoha', 'axonometric', 'azulejo', 'blueprint', 'blueprint_cyan', 'bogolan', 'bricolage', 'brutalist', 'castelo_branco', 'cherokee', 'chiefs', 'chipaz', 'circuit', 'collage', 'concrete', 'cubist', 'current', 'cyber_mesh', 'cypress_hills', 'dazzler', 'flow', 'framed_vista', 'fret_bands', 'glitch', 'interlace', 'kagome', 'kanzemizu', 'kente', 'kepe', 'kikkou', 'kishtima', 'kolya', 'kshtir', 'kuba', 'kudo', 'malevich', 'mastor', 'matsukawa', 'maximalism', 'mondrian', 'narmuny', 'navajo', 'optical_box', 'orak', 'pakshats', 'panks', 'panoramic_dunes', 'pre_columbian', 'pulay', 'river_flow', 'rolling_hills', 'seigaiha', 'serape_net', 'sermat', 'sermat-kudo', 'shippo', 'shiprock', 'sierra_sunset', 'spider_cross', 'stolz', 'structural', 'tangents', 'tol', 'ved', 'verena', 'viana', 'virma', 'wari', 'woodcut', 'yagasuri', 'yoshiwara'];

var CANVAS_OPTS = ['white'];

var MOTIF_DESCS = {
    'random': 'Random Motif',
    'typewriter': 'Courier Typewriter (Density)',
    'typewriter_quine': 'Typewriter Quine (Source Code)',
    'typewriter_classic': 'Classic Density Matrix (/ * #)',
    'chopin': 'Chopin Dactylopoème (Woven Typewriter)',
    'stars_and_stripes': 'Nautical Star & Striped Banding',
    'tatreez': 'Palestinian Tatreez Stitch',
    'quatrefoil': 'Gothic Quatrefoil Lace',
    'ichthus': 'Early Christian Ichthus Fish',
    'platen': 'Classic 3-Petal Platen',
    'square': 'Filled Square (\u25A0)',
    'viana_heart': 'Viana Heart (❤)',
    'typewriter_comma': 'Typewriter Comma (,)',
    'typewriter_dot': 'Typewriter Period (.)',
    'typewriter_plus': 'Typewriter Plus (+)',
    'typewriter_x': 'Typewriter Cross (X)',
    'typewriter_asterisk': 'Typewriter Asterisk (*)',
    'typewriter_slash': 'Typewriter Slash (/)',
    'typewriter_dash': 'Typewriter Dash (-)'
};

var MOTIF_PATHS = {
    'ichthus': 'M19.370 7.130C17.927 10.077 14.599 12.874 10.900 13.817 7.218 14.755 3.257 13.880 0.474 9.740L0.000 10.000L0.474 10.260C3.257 6.120 7.218 5.245 10.900 6.183 14.599 7.126 17.927 9.923 19.370 12.870Z',
    'platen': 'M 100,5 C 215,90 270,225 185,275 C 95,315 15,225 80,115 C 50,220 15,325 100,385 C 190,445 285,385 240,290 C 275,370 295,455 210,480 C 120,500 45,430 70,335 C 20,410 10,480 80,515 C 165,560 250,500 220,410 C 240,490 240,555 160,570 C 80,580 -25,485 10,385 C 45,280 -60,180 -5,80 C 50,-10 135,-35 100,5 Z',
    'quatrefoil': 'M 15.12,10.63 c -0.34,-0.29 -0.74,-0.50 -1.16,-0.63 c 0.42,-0.13 0.82,-0.34 1.16,-0.63 c 1.06,-0.91 2.35,-4.62 2.86,-6.17 c 0.05,-0.14 0.03,-0.27 -0.04,-0.38 c -0.08,-0.12 -0.23,-0.17 -0.40,-0.14 c -1.61,0.27 -5.47,1.00 -6.52,1.91 c -0.52,0.45 -0.86,1.03 -1.00,1.65 c -0.15,-0.62 -0.48,-1.21 -1.00,-1.65 c -1.06,-0.91 -4.92,-1.64 -6.52,-1.91 c -0.18,-0.03 -0.32,0.02 -0.40,0.14 c -0.07,0.10 -0.09,0.24 -0.04,0.38 c 0.51,1.55 1.80,5.26 2.86,6.17 c 0.34,0.29 0.74,0.50 1.16,0.63 c -0.42,0.13 -0.82,0.34 -1.16,0.63 c -1.06,0.91 -2.35,4.62 -2.86,6.17 c -0.05,0.14 -0.03,0.27 0.04,0.38 c 0.07,0.10 0.18,0.15 0.31,0.15 c 0.03,0 0.06,0.00 0.09,-0.01 c 1.61,-0.27 5.47,-1.00 6.52,-1.91 c 0.52,-0.45 0.86,-1.03 1.00,-1.65 c 0.15,0.62 0.48,1.21 1.00,1.65 c 1.06,0.91 4.92,1.64 6.52,1.91 c 0.03,0.01 0.06,0.01 0.09,0.01 c 0.13,0 0.24,-0.05 0.31,-0.15 c 0.07,-0.10 0.09,-0.24 0.04,-0.38 C 17.47,15.25 16.17,11.54 15.12,10.63 Z M 10,8.5 a 1.5,1.5 0 1,0 0,3 a 1.5,1.5 0 1,0 0,-3 Z',
    'tatreez': 'M 2,6 L 6,2 L 10,6 L 14,2 L 18,6 L 14,10 L 18,14 L 14,18 L 10,14 L 6,18 L 2,14 L 6,10 Z',
    'square': 'M 2,2 L 18,2 L 18,18 L 2,18 Z',
    'viana_heart': 'M10 19C4 13 4 8 10 8C16 8 16 13 10 19 M10 8C8 6 8 2 10 1C12 2 12 6 10 8',
    'typewriter': 'M 9.5,14 L 10.5,14 L 11,14.5 L 11,15.5 L 10.5,16 L 9.5,16 L 9,15.5 L 9,14.5 Z',
    'typewriter_comma': 'M 9.5,12 L 10.5,12 L 11,12.5 L 11,13.5 L 10.5,14 L 10,15.5 L 9,15.5 L 9.5,14 L 9,13.5 L 9,12.5 Z',
    'typewriter_dot': 'M 9.5,14 L 10.5,14 L 11,14.5 L 11,15.5 L 10.5,16 L 9.5,16 L 9,15.5 L 9,14.5 Z',
    'typewriter_plus': 'M 8,4 L 12,4 L 12,8 L 16,8 L 16,12 L 12,12 L 12,16 L 8,16 L 8,12 L 4,12 L 4,8 L 8,8 Z',
    'typewriter_x': 'M 2.5,3 L 8.5,3 L 8.5,4.5 L 7,4.5 L 10.38,9 L 13,4.5 L 10.5,4.5 L 10.5,3 L 16.5,3 L 16.5,4.5 L 14,4.5 L 10.94,9.75 L 16,16.5 L 17.5,16.5 L 17.5,18 L 11.5,18 L 11.5,16.5 L 13,16.5 L 9.63,12 L 7,16.5 L 9.5,16.5 L 9.5,18 L 3.5,18 L 3.5,16.5 L 6,16.5 L 9.06,11.25 L 4,4.5 L 2.5,4.5 Z',
    'typewriter_classic': 'M 7,3 L 9,3 L 9,7 L 11,7 L 11,3 L 13,3 L 13,7 L 17,7 L 17,9 L 13,9 L 13,11 L 17,11 L 17,13 L 13,13 L 13,17 L 11,17 L 11,13 L 9,13 L 9,17 L 7,17 L 7,13 L 3,13 L 3,11 L 7,11 L 7,9 L 3,9 L 3,7 L 7,7 Z',
    'typewriter_asterisk': 'M 8.8,3 L 11.2,3 L 11.2,8.2 L 15.9,5.5 L 17.1,7.6 L 12.5,10.5 L 17.1,13.4 L 15.9,15.5 L 11.2,12.8 L 11.2,18 L 8.8,18 L 8.8,12.8 L 4.1,15.5 L 2.9,13.4 L 7.5,10.5 L 2.9,7.6 L 4.1,5.5 L 8.8,8.2 Z',
    'typewriter_slash': 'M 5,17 L 17,5 L 15,3 L 3,15 Z',
    'typewriter_dash': 'M 4,9 L 16,9 L 16,11 L 4,11 Z',
    'typewriter_square': 'M 3,3 L 17,3 L 17,17 L 3,17 Z',
    'typewriter_triangle': 'M 10,3 L 17,17 L 3,17 Z',
    'typewriter_circle': 'M 10,3 A 7 7 0 1 1 9.9,3 Z',
    'star': 'M 10,1 L 12.7,6.8 L 19,7.5 L 14.3,11.8 L 15.6,18 L 10,15 L 4.4,18 L 5.7,11.8 L 1,7.5 L 7.3,6.8 Z',
    'stripes': 'M 2,4 L 18,4 L 18,6 L 2,6 Z M 2,9 L 18,9 L 18,11 L 2,11 Z M 2,14 L 18,14 L 18,16 L 2,16 Z',
    'stars_and_stripes': 'M 10,1 L 12.7,6.8 L 19,7.5 L 14.3,11.8 L 15.6,18 L 10,15 L 4.4,18 L 5.7,11.8 L 1,7.5 L 7.3,6.8 Z'
};

var CHROME_DESCS = {
    'stars_and_stripes': 'Stars and Stripes (Red & Blue)',
    'typewriter_ribbon_multicolored': 'Typewriter Ribbon Multicolored',
    'typewriter_black': 'Typewriter Black (Pure Carbon Black Monochrome)',
    'typewriter_black_red': 'Typewriter Black & Red (Bi-Color Ribbon)',
    'adama': 'Earth / Southwest',
    'adire': 'Yoruba Indigo',
    'afarsek': 'Peach',
    'aizome': 'Traditional Indigo',
    'alentejo': 'Alentejo Earth / Tapetes de Arraiolos',
    'alon': 'Oak',
    'argaman': 'Crimson',
    'azulejo_classico': 'Portuguese Azulejo (Classic Blue/White)',
    'bahir': 'Radiant',
    'barzel': 'Iron',
    'bedouin_night': 'Tatreez - electric primaries on burgundy',
    'bleached': 'Stark White / Titanium',
    'blueprint_cyan': 'Blueprint Cyanotype',
    'bogolan': 'Mali Mudcloth',
    'bricolage': 'Mixed Media Bricolage',
    'burntwater': 'Earthy Autumnal Vegetal',
    'castelo_branco': 'Castelo Branco embroidery',
    'cherokee': 'Tsalagi / Cherokee Earth',
    'chinle': 'Soft High Desert Pastels',
    'collage': 'Textile Patchwork Scraps',
    'concrete': 'Brutalist Concrete',
    'crystal': 'Vegetal Forest Greens',
    'cyber_mesh': 'Industrial Cyber-Mesh',
    'erev': 'Evening',
    'flow': 'Flow Field (Warm Cream)',
    'flow_deep': 'Flow Field (Deep Navy/Teal)',
    'gan': 'Garden / Green',
    'ganado': 'Classic Ganado Red',
    'gaza_dusk': 'Tatreez - dense crimson gradient, slate/mint base',
    'gehelet': 'Ember / Umber',
    'glitch_acid': 'Digital Corrosion (Acid)',
    'glitch_heat': 'Thermal Glitch',
    'glitch_void': 'Hardware Error',
    'kabuki': 'Theatre of the Focal',
    'kagetoh': 'Transitional Dazzler',
    'kakiishibu': 'Persimmon Tannin',
    'karkom': 'Saffron / Amber',
    'kaspi': 'Silver / Slate',
    'katan': 'Linen / Cream',
    'kelme': 'Ink & Parchment',
    'kente': 'Ghanaian Woven Asante',
    'kinjiki': 'Imperial Garden (Boosted)',
    'kinpak': 'Gold Leaf / Lacquer',
    'kokkos': 'Mediterranean Grain',
    'kuba': 'Congo Raffia',
    'lissitzky': 'Lissitzky [architectural PROUN — Monochrome]',
    'madder': 'Madder Root',
    'manueline': 'Manueline / Portuguese Late Gothic',
    'matcha': 'Tea Ceremony Greens',
    'matsuri': 'Night Market Festival',
    'minho': 'Minho Red / Traje à Vianesa',
    'moki': 'Pueblo Dark Bands',
    'memphis': 'Memphis Group (1980s Postmodern)',
    'miami_basel': 'Art Basel Miami Beach 2026',
    'mondrian': 'Piet Mondrian / De Stijl',
    'murex': 'Tyrian Purple',
    'nana': 'Mint',
    'navajo': 'Southwest Rug Bands',
    'negev_gold': 'Tatreez - desert sands, stark blues',
    'neshef': 'Low-Key',
    'oil_pastel': 'Faber-Castell Oil Pastel Set',
    'olive_grove': 'Tatreez - orange sun, blue sky, dark heavy greens',
    'orak': 'Spectral Observation',
    'palestine_dawn': 'Tatreez - pale pink sky, deep green/red cypress',
    'panar': 'Aged Parchment',
    'pepel': 'Ash / Volcanic',
    'pombalino': 'Pombalino (Blue, Ochre, Sage)',
    'porphyra': 'Ancient Purple',
    'primaries': 'Red, Yellow, Blue, and Black only',
    'random': 'Random',
    'rodchenko': 'Rodchenko [constructivist yellow]',
    'ruach': 'Atmospheric / Kinetic',
    'rutsya': 'Deep Obsidian',
    'sakura': 'Cherry Blossom',
    'savonnerie': 'Dense French Carpets',
    'seigaiha': 'Deep Indigo Waves',
    'shahar': 'Moonlight / Silver',
    'shemen': 'Olive Oil',
    'shibui': 'Astringent / Earthy',
    'shiprock': 'Navajo Eye-Dazzler / Shiprock',
    'shoshan': 'Lily / Floral',
    'simcha': 'Vibrant / Chromatic',
    'sintra': 'Sintra / Portuguese Romanticism',
    'spectrum': 'OKLCH Generative — Random Harmony Palette',
    'stolz': 'Gunta Stölzl Bauhaus Samplers',
    'structural': 'Architectural / Constructivist',
    'sumi': 'Calligraphy Inkbox',
    'suprematism': 'Suprematism [Malevich red/black]',
    'tarshish': 'Sea-trader Azure',
    'teec_nos_pos': 'Teec Nos Pos / Navajo Geometric',
    'tekhelet': 'Indigo — Judean desert blue dye family',
    'tukmo': 'Andean Patchwork',
    'two_grey_hills': 'Two Grey Hills / Navajo Natural',
    'uguisu': 'Japanese Nightingale Green',
    'verena': 'Verena Loewensberg / Swiss Concrete',
    'viana': 'Viana do Castelo',
    'viride': 'Green earth — forest dye from the color plates',
    'wari': 'Wari / Pre-Columbian Patchwork',
    'woodcut': 'Raw Birch / Dark Walnut',
    'yam': 'Sea / Navy',
    'zahav': 'Gold / Luxe'
};


var ENGINE_DESCS = {
    'adama': 'Earth / Southwest',
    'adire': 'Indigo Resist Dye',
    'argyle': 'Lace & Lattice',
    'arraiolos': 'Arraiolos Rug Geometry',
    'art_deco': 'Sweeping Nested Lines',
    'asanoha': 'Hemp Leaf Star Lattice',
    'axonometric': 'Axonometric 3D Volumes',
    'azulejo': 'Portuguese Azulejo Tile',
    'blueprint': 'Technical Blueprint',
    'blueprint_cyan': 'Blueprint Cyanotype',
    'bogolan': 'Mudcloth Strips',
    'bricolage': 'Mixed Media Bricolage',
    'brutalist': 'Brutalist Monolith',
    'castelo_branco': 'Castelo Branco Embroidery',
    'cherokee': 'Double-Weave Cane Basketry',
    'chiefs': 'Classic Phase Blankets',
    'chipaz': 'Sunburst',
    'circuit': 'Integrated Circuitry',
    'collage': 'Overlapping Scraps & Stitching',
    'concrete': 'Exposed Concrete',
    'cubist': 'Overlapping Rectangular Slabs',
    'current': 'Directional Band Stack',
    'cyber_mesh': 'Industrial Cyber-Mesh',
    'cypress_hills': 'Tatreez Cypress & Rolling Hills',
    'dazzler': 'Transitional Eye-Dazzler',
    'flow': 'Curved Ribbon Flow Field',
    'framed_vista': 'Decorative Bordered Frame',
    'fret_bands': 'Navajo Fretwork Bands',
    'glitch': 'Data Corruption (Glitch)',
    'interlace': 'Islamic Strapwork',
    'kagome': 'Tri-Axial Basket Weave',
    'kanzemizu': 'Stippled Swirling Water',
    'kente': 'Kente Narrow-Strip Weave',
    'kepe': 'Crown Peaks',
    'kikkou': 'Tortoiseshell Hexagons',
    'kishtima': 'Tessellation',
    'kolya': 'Corner Meander',
    'kshtir': 'Rotational Pinwheel',
    'kuba': 'Raffia Patches',
    'kudo': 'Brick Masonry',
    'malevich': 'Suprematism (Malevich)',
    'mastor': 'Diamonds & Diagonals',
    'matsukawa': 'Pine Bark Lattice',
    'maximalism': 'Intentional Maximalism (Art Basel)',
    'mondrian': 'De Stijl / Mondrian Grid',
    'narmuny': 'Decorative Strips',
    'navajo': 'Stepped Navajo Bands',
    'optical_box': 'Concentric Optical Boxes',
    'orak': 'Spectral Recursive',
    'pakshats': 'Interlocking Meander',
    'panks': 'Floral Rosettes',
    'panoramic_dunes': 'Sweeping Continental Dunes',
    'pre_columbian': 'Stepped L-Shapes & Zig-zags',
    'pulay': 'Varied Grid Bands',
    'random': 'Random',
    'river_flow': 'River Flow (Fluid Streams)',
    'rolling_hills': 'Rolling Hills Contours',
    'seigaiha': 'Japanese Waves',
    'serape_net': 'Terraced Chevron Net',
    'sermat': 'Tiled Crosses',
    'sermat-kudo': 'Compound Sermat-Kudo',
    'shippo': 'Seven Treasures / Interlocking Circles',
    'shiprock': 'Shiprock Layout',
    'sierra_sunset': 'Layered Mountain Sierra',
    'spider_cross': 'Spider Woman Crosses',
    'stolz': 'Bauhaus Architectural Grid',
    'structural': 'Structural Lattice',
    'tangents': 'Tangent Lines',
    'tol': 'Interlocking S-Curves',
    'ved': 'Interlocking S-Curves',
    'verena': 'Loewensberg Diagonal Bands',
    'viana': 'Viana do Castelo Folk Embroidery',
    'virma': 'Stepped Forest Frame',
    'wari': 'Patchwork Checks',
    'woodcut': 'Chiseled / Woodblock Carving',
    'yagasuri': 'Arrow Feathers',
    'yoshiwara': 'Interlocking Chains'
};

// ── PRNG (Park-Miller LCG) ────────────────────────────────────────────────────
function makePRNG(s) {
    var P = 2147483647;
    s = ((s + 1590398727) % P);
    if (s <= 0) s += P - 1;
    var t = s;
    function x() { t = (t * 16807) % P; return t; }
    x(); // warm up
    return {
        rfl: function (a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return (x() - 1) / (P - 1) * (b - a) + a; },
        rin: function (a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return ((x() - 1) % (b - a + 1)) + a; }
    };
}

// ── Math Utils ────────────────────────────────────────────────────────────
function safeMod(n, m) { return ((n % m) + m) % m; }

// ── OKLCH Palette Generator (Spectrum Chrome) ─────────────────────────────
// Implements CSS Color Level 4 OKLCH → OKLab → Linear sRGB → sRGB → Hex
// Inspired by ColorPalette Pro (github.com/royalfig/color-palette-generator)
// No external dependencies — pure math.

function oklchToHex(L, C, H) {
    // 1. OKLCH → OKLab
    var h = H * Math.PI / 180;
    var a = C * Math.cos(h);
    var b = C * Math.sin(h);

    // 2. OKLab → Linear sRGB (via LMS)
    var l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    var m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    var s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    var l = l_ * l_ * l_;
    var m = m_ * m_ * m_;
    var s = s_ * s_ * s_;

    var r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    var g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    var bCh = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    // 3. Linear sRGB → Gamma sRGB (clamp to [0,1] first)
    function toGamma(v) {
        v = Math.max(0, Math.min(1, v));
        return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    }

    var R = Math.round(toGamma(r) * 255);
    var G = Math.round(toGamma(g) * 255);
    var B = Math.round(toGamma(bCh) * 255);

    return '#' + ((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1).toUpperCase();
}

function generateSpectrumPalette(seed) {
    // Seeded PRNG for deterministic palettes per seed
    var prng = makePRNG(seed + 9999991);
    var rfl = prng.rfl;
    var rin = prng.rin;

    // -- 1. Pick base hue (0-360)
    var baseHue = rfl(0, 360);

    // -- 2. Pick harmony type
    var harmonyTypes = ['analogous', 'triadic', 'complementary', 'split-complementary', 'tetradic'];
    var harmony = harmonyTypes[rin(0, harmonyTypes.length - 1)];

    // -- 3. Build a set of hues based on harmony
    var hues = [baseHue];
    switch (harmony) {
        case 'analogous':
            hues = [
                baseHue,
                (baseHue - 30 + 360) % 360,
                (baseHue - 15 + 360) % 360,
                (baseHue + 15) % 360,
                (baseHue + 30) % 360,
            ];
            break;
        case 'triadic':
            hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
            break;
        case 'complementary':
            hues = [baseHue, (baseHue + 180) % 360];
            break;
        case 'split-complementary':
            hues = [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
            break;
        case 'tetradic':
            hues = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
            break;
    }

    // -- 4. Pick a lightness / chroma profile
    // profiles: [lightMin, lightMax, chromaMin, chromaMax, label]
    var profiles = [
        [0.20, 0.50, 0.12, 0.28, 'dark-vivid'],     // dark + vivid
        [0.25, 0.55, 0.06, 0.16, 'dark-muted'],     // dark + muted (earthy)
        [0.45, 0.75, 0.10, 0.28, 'mid-vivid'],      // midtone vivid
        [0.55, 0.80, 0.04, 0.14, 'mid-muted'],      // midtone muted (pastel)
        [0.70, 0.92, 0.06, 0.20, 'light'],           // light / airy
        [0.10, 0.35, 0.16, 0.32, 'deep'],            // very deep / saturated
    ];
    var profile = profiles[rin(0, profiles.length - 1)];
    var lMin = profile[0], lMax = profile[1];
    var cMin = profile[2], cMax = profile[3];

    // -- 5. Generate palette colours from hue set + tonal variations
    var palette = [];
    var nShades = rin(2, 4); // how many lightness steps per hue family

    for (var hi = 0; hi < hues.length; hi++) {
        var H = hues[hi];
        // Add a jitter to chroma per hue to keep palette interesting
        var chromaJitter = rfl(-0.04, 0.04);
        var C = Math.max(0.01, Math.min(0.40, rfl(cMin, cMax) + chromaJitter));

        for (var si = 0; si < nShades; si++) {
            var t = nShades === 1 ? 0.5 : si / (nShades - 1);
            var L = lMin + t * (lMax - lMin);
            // Add slight hue temperature shift at extremes
            var tempShift = (t < 0.3 ? -4 : t > 0.7 ? 4 : 0);
            var finalH = (H + tempShift + 360) % 360;
            var hex = oklchToHex(L, C, finalH);
            var weight = (si === 0 || si === nShades - 1) ? 3 : 2; // emphasize anchors
            palette.push({ c: hex, r: weight });
        }
    }

    // -- 6. Always add a near-dark anchor (near-black), relative to hue temp
    var darkH = (baseHue + (rfl(0, 1) < 0.5 ? 10 : -10) + 360) % 360;
    palette.push({ c: oklchToHex(rfl(0.08, 0.18), rfl(0.02, 0.08), darkH), r: 3 });

    // -- 7. Maybe add a bright accent (1 in 3 chance)
    if (rin(0, 2) === 0) {
        var accentH = (baseHue + 180 + rfl(-20, 20) + 360) % 360;
        var accentL = rfl(0.65, 0.88);
        var accentC = rfl(0.18, 0.36);
        palette.push({ c: oklchToHex(accentL, accentC, accentH), r: 1, v: 1 });
    }

    return palette;
}

// Register spectrum as a special dynamic chrome
PALETTES['spectrum'] = generateSpectrumPalette;


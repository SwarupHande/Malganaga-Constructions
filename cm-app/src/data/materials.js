// Suggestions for estimate line-item descriptions, grouped by estimate category.
// `unit` is shown as a hint; `keywords` are extra search words (synonyms, local Marathi/Hindi names).
// Order matters: earlier items are shown first when the field is empty and win ties.
// Anything not listed can still be entered via "Other (type your own)" in the estimate form.

export const ESTIMATE_CATALOG = {
  // Company material list (Sr. No. 1-70).
  Material: [
    // Cement
    { name: 'Cement OPC', unit: 'Bag', keywords: 'cement opc 53 43' },
    { name: 'Cement PPC', unit: 'Bag', keywords: 'cement ppc pozzolana' },

    // Steel
    { name: 'TMT Steel 8mm', unit: 'Kg', keywords: 'steel rebar sariya saliya rod tmt' },
    { name: 'TMT Steel 10mm', unit: 'Kg', keywords: 'steel rebar sariya saliya rod tmt' },
    { name: 'TMT Steel 12mm', unit: 'Kg', keywords: 'steel rebar sariya saliya rod tmt' },
    { name: 'TMT Steel 16mm', unit: 'Kg', keywords: 'steel rebar sariya saliya rod tmt' },
    { name: 'TMT Steel 20mm', unit: 'Kg', keywords: 'steel rebar sariya saliya rod tmt' },
    { name: 'Binding Wire', unit: 'Kg', keywords: 'steel tying tar' },

    // Sand & aggregate
    { name: 'River Sand', unit: 'Brass', keywords: 'sand reti vaalu' },
    { name: 'M-Sand', unit: 'Brass', keywords: 'sand crushed manufactured reti' },
    { name: 'Plaster Sand', unit: 'Brass', keywords: 'sand p-sand plastering reti' },
    { name: 'Aggregate 10mm', unit: 'Brass', keywords: 'khadi gitti stone metal' },
    { name: 'Aggregate 20mm', unit: 'Brass', keywords: 'khadi gitti stone metal' },
    { name: 'Aggregate 40mm', unit: 'Brass', keywords: 'khadi gitti stone metal' },
    { name: 'Stone Metal', unit: 'Brass', keywords: 'khadi gitti aggregate soling rubble' },

    // Masonry
    { name: 'Red Bricks', unit: 'Nos.', keywords: 'brick vit eent clay' },
    { name: 'AAC Blocks', unit: 'Nos.', keywords: 'block siporex' },
    { name: 'Solid Concrete Blocks', unit: 'Nos.', keywords: 'block cement' },

    // Water & chemicals
    { name: 'Water', unit: 'Litres', keywords: 'pani tanker' },
    { name: 'Waterproofing Chemical', unit: 'Kg / Ltr', keywords: 'waterproof chemical' },
    { name: 'Concrete Admixture', unit: 'Ltr', keywords: 'chemical plasticiser' },

    // Shuttering & scaffolding
    { name: 'Shuttering Plywood', unit: 'Sheet', keywords: 'formwork centering ply' },
    { name: 'Centering Plates', unit: 'Nos.', keywords: 'formwork shuttering' },
    { name: 'Scaffolding Pipes', unit: 'Nos.', keywords: 'scaffold' },
    { name: 'Shuttering Oil', unit: 'Ltr', keywords: 'formwork centering' },

    // Paint
    { name: 'Wall Putty', unit: 'Bag', keywords: 'paint' },
    { name: 'Wall Primer', unit: 'Ltr', keywords: 'paint' },
    { name: 'Interior Paint', unit: 'Ltr', keywords: 'paint color colour emulsion' },
    { name: 'Exterior Paint', unit: 'Ltr', keywords: 'paint color colour emulsion' },
    { name: 'Enamel Paint', unit: 'Ltr', keywords: 'paint grill door' },

    // Flooring & tiling
    { name: 'Vitrified Tiles', unit: 'Sq. Ft.', keywords: 'tile flooring' },
    { name: 'Ceramic Tiles', unit: 'Sq. Ft.', keywords: 'tile wall dado' },
    { name: 'Anti-Skid Tiles', unit: 'Sq. Ft.', keywords: 'tile bathroom flooring' },
    { name: 'Granite', unit: 'Sq. Ft.', keywords: 'stone flooring' },
    { name: 'Marble', unit: 'Sq. Ft.', keywords: 'stone flooring' },
    { name: 'Tile Adhesive', unit: 'Bag', keywords: 'tile' },
    { name: 'Tile Grout', unit: 'Kg', keywords: 'tile' },

    // Plumbing & sanitary
    { name: 'CPVC Pipes', unit: 'Length', keywords: 'plumbing water pipe' },
    { name: 'PVC Pipes', unit: 'Length', keywords: 'plumbing pipe' },
    { name: 'SWR Pipes', unit: 'Length', keywords: 'plumbing drainage pipe' },
    { name: 'UPVC Pipes', unit: 'Length', keywords: 'plumbing water pipe' },
    { name: 'Pipe Fittings', unit: 'Nos.', keywords: 'plumbing elbow tee' },
    { name: 'Water Tank', unit: 'Nos.', keywords: 'plumbing tank sintex' },
    { name: 'Bathroom Fittings', unit: 'Set', keywords: 'plumbing tap cp bath' },
    { name: 'Sanitaryware', unit: 'Nos.', keywords: 'plumbing wc toilet wash basin' },

    // Electrical
    { name: 'Electrical Wire', unit: 'Coil', keywords: 'electrical wiring cable copper' },
    { name: 'PVC Conduit', unit: 'Length', keywords: 'electrical wiring pipe' },
    { name: 'Switches', unit: 'Nos.', keywords: 'electrical sockets modular' },
    { name: 'MCB', unit: 'Nos.', keywords: 'electrical breaker' },
    { name: 'Distribution Board', unit: 'Nos.', keywords: 'electrical db' },
    { name: 'Earthing Materials', unit: 'Set', keywords: 'electrical earth' },
    { name: 'Light Fittings', unit: 'Nos.', keywords: 'electrical lights fixtures' },

    // Doors & windows
    { name: 'Main Door', unit: 'Nos.', keywords: 'door wood' },
    { name: 'Internal Doors', unit: 'Nos.', keywords: 'door flush wood' },
    { name: 'Door Frames', unit: 'Nos.', keywords: 'door chaukat wood' },
    { name: 'Aluminium Windows', unit: 'Sq. Ft.', keywords: 'window sliding' },
    { name: 'Glass', unit: 'Sq. Ft.', keywords: 'window toughened' },
    { name: 'Hinges & Locks', unit: 'Set', keywords: 'door hardware handles' },

    // Railings
    { name: 'MS Railing', unit: 'Kg', keywords: 'railing steel grill' },
    { name: 'SS Railing', unit: 'Running Ft.', keywords: 'railing steel stainless' },

    // False ceiling & finishes
    { name: 'Gypsum Board', unit: 'Sheet', keywords: 'false ceiling' },
    { name: 'POP', unit: 'Bag', keywords: 'plaster of paris ceiling' },
    { name: 'False Ceiling Channel', unit: 'Length', keywords: 'ceiling gypsum' },
    { name: 'Wood Polish', unit: 'Ltr', keywords: 'polish door' },

    // Kitchen
    { name: 'Kitchen Granite', unit: 'Sq. Ft.', keywords: 'stone platform kitchen' },
    { name: 'Kitchen Cabinets', unit: 'Running Ft.', keywords: 'kitchen modular' },

    // Roofing, gate, misc
    { name: 'Roofing Sheets', unit: 'Sq. Ft.', keywords: 'roofing slanting metal' },
    { name: 'Gate Material', unit: 'Kg', keywords: 'gate steel ms' },
    { name: 'Anti-Termite Chemical', unit: 'Ltr', keywords: 'termite pest' },
    { name: 'Curing Compound', unit: 'Ltr', keywords: 'chemical curing' },

    // Extra items for our own stages (not in the Sr. No. 1-70 list)
    { name: 'Murum', unit: 'Brass', keywords: 'filling soil earth murrum' },
    { name: 'Rubble Stone', unit: 'Brass', keywords: 'soling dabar stone rubber' },
    { name: 'Gypsum Plaster', unit: 'Bag', keywords: 'plaster' },
    { name: 'Texture Paint', unit: 'Ltr', keywords: 'paint color colour texture plaster' },
    { name: 'Stone Cladding', unit: 'Sq. Ft.', keywords: 'stone cliding elevation' },
  ],

  Overhead: [
    { name: 'Transport / freight charges', unit: 'trip', keywords: 'truck tempo delivery' },
    { name: 'JCB / excavator hire', unit: 'hour', keywords: 'equipment machine excavation' },
    { name: 'Concrete mixer hire', unit: 'day', keywords: 'equipment machine' },
    { name: 'Needle vibrator hire', unit: 'day', keywords: 'equipment machine' },
    { name: 'Scaffolding hire', unit: 'month', keywords: 'equipment' },
    { name: 'Water tanker', unit: 'trip', keywords: 'water' },
    { name: 'Temporary electricity connection', unit: 'lump sum', keywords: 'msedcl power' },
    { name: 'Site fencing & gate', unit: 'lump sum', keywords: 'site' },
    { name: 'Site security / watchman', unit: 'month', keywords: 'site guard' },
    { name: 'Building permission & approvals', unit: 'lump sum', keywords: 'permit sanction' },
    { name: 'Architect fees', unit: 'lump sum', keywords: 'design' },
    { name: 'Structural consultant fees', unit: 'lump sum', keywords: 'design engineer' },
    { name: 'Soil testing', unit: 'lump sum', keywords: 'test' },
    { name: 'Material testing (cube / steel)', unit: 'lump sum', keywords: 'test' },
    { name: 'Debris removal', unit: 'trip', keywords: 'cleaning' },
    { name: 'Insurance', unit: 'lump sum', keywords: '' },
    { name: 'Contingency (5%)', unit: 'lump sum', keywords: 'buffer' },
  ],
};

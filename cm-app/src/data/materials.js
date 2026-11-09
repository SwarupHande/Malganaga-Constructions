// Suggestions for estimate line-item descriptions, grouped by estimate category.
// `unit` is shown as a hint; `keywords` are extra search words (synonyms, local Marathi/Hindi names).
// Order matters: earlier items are shown first when the field is empty and win ties.

export const ESTIMATE_CATALOG = {
  Material: [
    // Cement & concrete
    { name: 'Cement OPC 53 grade', unit: 'bag (50 kg)', keywords: 'cement opc' },
    { name: 'Cement OPC 43 grade', unit: 'bag (50 kg)', keywords: 'cement opc' },
    { name: 'Cement PPC (Portland Pozzolana)', unit: 'bag (50 kg)', keywords: 'cement ppc' },
    { name: 'Cement PSC (Portland Slag)', unit: 'bag (50 kg)', keywords: 'cement psc' },
    { name: 'White cement', unit: 'kg', keywords: 'cement' },
    { name: 'Ready-mix concrete M20', unit: 'cu.m', keywords: 'rmc concrete' },
    { name: 'Ready-mix concrete M25', unit: 'cu.m', keywords: 'rmc concrete' },
    { name: 'Ready-mix concrete M30', unit: 'cu.m', keywords: 'rmc concrete' },
    { name: 'Concrete admixture (plasticiser)', unit: 'litre', keywords: 'chemical' },
    { name: 'Curing compound', unit: 'litre', keywords: 'chemical' },

    // Steel
    { name: 'TMT steel bars Fe 500 - 8 mm', unit: 'kg', keywords: 'steel rebar sariya saliya rod' },
    { name: 'TMT steel bars Fe 500 - 10 mm', unit: 'kg', keywords: 'steel rebar sariya saliya rod' },
    { name: 'TMT steel bars Fe 500 - 12 mm', unit: 'kg', keywords: 'steel rebar sariya saliya rod' },
    { name: 'TMT steel bars Fe 500 - 16 mm', unit: 'kg', keywords: 'steel rebar sariya saliya rod' },
    { name: 'TMT steel bars Fe 500 - 20 mm', unit: 'kg', keywords: 'steel rebar sariya saliya rod' },
    { name: 'TMT steel bars Fe 500D', unit: 'tonne', keywords: 'steel rebar sariya saliya rod' },
    { name: 'Binding wire', unit: 'kg', keywords: 'steel tying' },
    { name: 'MS angle / channel', unit: 'kg', keywords: 'steel structural' },

    // Sand, aggregate, fill
    { name: 'River sand', unit: 'brass', keywords: 'sand reti vaalu' },
    { name: 'M-sand (manufactured sand)', unit: 'brass', keywords: 'sand crushed reti' },
    { name: 'P-sand (plastering sand)', unit: 'brass', keywords: 'sand plaster reti' },
    { name: 'Aggregate 10 mm', unit: 'brass', keywords: 'khadi gitti stone metal' },
    { name: 'Aggregate 20 mm', unit: 'brass', keywords: 'khadi gitti stone metal' },
    { name: 'Aggregate 40 mm', unit: 'brass', keywords: 'khadi gitti stone metal' },
    { name: 'Murum (filling soil)', unit: 'brass', keywords: 'filling earth soil' },
    { name: 'Rubble stone (soling)', unit: 'brass', keywords: 'soling dabar stone' },

    // Masonry
    { name: 'Red clay bricks', unit: 'nos', keywords: 'brick vit eent' },
    { name: 'Fly ash bricks', unit: 'nos', keywords: 'brick vit eent' },
    { name: 'AAC blocks', unit: 'cu.m', keywords: 'block siporex' },
    { name: 'Solid concrete blocks', unit: 'nos', keywords: 'block cement' },
    { name: 'Hollow concrete blocks', unit: 'nos', keywords: 'block cement' },
    { name: 'Block jointing mortar', unit: 'bag', keywords: 'adhesive aac' },

    // Waterproofing
    { name: 'Waterproofing compound (integral)', unit: 'litre', keywords: 'waterproof chemical' },
    { name: 'Waterproofing coating (terrace)', unit: 'litre', keywords: 'waterproof' },
    { name: 'APP waterproofing membrane', unit: 'sq.m', keywords: 'waterproof' },
    { name: 'Anti-termite chemical', unit: 'litre', keywords: 'termite pest' },

    // Flooring & tiling
    { name: 'Vitrified floor tiles', unit: 'sq.ft', keywords: 'tile flooring' },
    { name: 'Ceramic wall tiles', unit: 'sq.ft', keywords: 'tile dado' },
    { name: 'Anti-skid tiles', unit: 'sq.ft', keywords: 'tile bathroom flooring' },
    { name: 'Granite', unit: 'sq.ft', keywords: 'stone flooring kitchen' },
    { name: 'Marble', unit: 'sq.ft', keywords: 'stone flooring' },
    { name: 'Kota stone', unit: 'sq.ft', keywords: 'stone flooring' },
    { name: 'Shahabad stone', unit: 'sq.ft', keywords: 'stone flooring' },
    { name: 'Tile adhesive', unit: 'bag', keywords: 'tile' },
    { name: 'Tile grout', unit: 'kg', keywords: 'tile' },

    // Plaster & finishes
    { name: 'Gypsum plaster', unit: 'bag', keywords: 'plaster' },
    { name: 'POP (Plaster of Paris)', unit: 'bag', keywords: 'plaster pop' },
    { name: 'Wall putty', unit: 'kg', keywords: 'paint' },
    { name: 'Primer', unit: 'litre', keywords: 'paint' },
    { name: 'Interior emulsion paint', unit: 'litre', keywords: 'paint color colour' },
    { name: 'Exterior emulsion paint', unit: 'litre', keywords: 'paint color colour' },
    { name: 'Texture paint', unit: 'litre', keywords: 'paint color colour plaster' },
    { name: 'Enamel paint', unit: 'litre', keywords: 'paint grill door' },
    { name: 'Gypsum board false ceiling', unit: 'sq.ft', keywords: 'ceiling pop' },
    { name: 'Stone cladding', unit: 'sq.ft', keywords: 'stone cliding elevation' },

    // Doors, windows, railings
    { name: 'Teak wood door frame', unit: 'nos', keywords: 'door chaukat wood' },
    { name: 'Flush door', unit: 'nos', keywords: 'door wood' },
    { name: 'Plywood', unit: 'sq.ft', keywords: 'wood ply' },
    { name: 'Laminate sheets', unit: 'nos', keywords: 'wood sunmica' },
    { name: 'UPVC windows', unit: 'sq.ft', keywords: 'window' },
    { name: 'Aluminium sliding windows', unit: 'sq.ft', keywords: 'window sliding' },
    { name: 'Toughened glass', unit: 'sq.ft', keywords: 'glass window' },
    { name: 'MS window grill', unit: 'kg', keywords: 'grill grilling steel' },
    { name: 'SS railing', unit: 'r.ft', keywords: 'railing steel stainless' },
    { name: 'MS railing', unit: 'r.ft', keywords: 'railing steel' },
    { name: 'Door hardware (hinges, locks, handles)', unit: 'set', keywords: 'door' },

    // Electrical
    { name: 'PVC conduit pipes', unit: 'nos', keywords: 'electrical wiring' },
    { name: 'Copper wire 1.5 sq.mm', unit: 'coil', keywords: 'electrical wiring cable' },
    { name: 'Copper wire 2.5 sq.mm', unit: 'coil', keywords: 'electrical wiring cable' },
    { name: 'Copper wire 4 sq.mm', unit: 'coil', keywords: 'electrical wiring cable' },
    { name: 'Modular switches & sockets', unit: 'nos', keywords: 'electrical' },
    { name: 'MCB distribution board', unit: 'nos', keywords: 'electrical db' },
    { name: 'Light fixtures', unit: 'nos', keywords: 'electrical lights' },

    // Plumbing & sanitary
    { name: 'CPVC pipes & fittings', unit: 'r.ft', keywords: 'plumbing water' },
    { name: 'UPVC pipes & fittings', unit: 'r.ft', keywords: 'plumbing water' },
    { name: 'PVC SWR drainage pipes', unit: 'r.ft', keywords: 'plumbing drainage' },
    { name: 'Overhead water tank', unit: 'nos', keywords: 'plumbing tank sintex' },
    { name: 'Sanitaryware (WC, wash basin)', unit: 'set', keywords: 'plumbing bathroom toilet' },
    { name: 'CP bath fittings', unit: 'set', keywords: 'plumbing bathroom tap' },

    // Roofing
    { name: 'Mangalore roof tiles', unit: 'nos', keywords: 'roofing slanting kaul' },
    { name: 'Metal roofing sheets', unit: 'sq.ft', keywords: 'roofing slanting' },
    { name: 'Polycarbonate sheets', unit: 'sq.ft', keywords: 'roofing' },

    // Shuttering
    { name: 'Shuttering plywood', unit: 'sq.ft', keywords: 'formwork centering' },
    { name: 'Shuttering plates & props (hire)', unit: 'month', keywords: 'formwork centering' },
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

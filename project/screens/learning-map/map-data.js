// Map data dynamically wired to modulData (16 nodes total across 4 Bagian)
const nodePositions = [
  { posIndex: 1, x: 32.66, y: 43.63, defaultIcon: "flag" },
  { posIndex: 2, x: 46.39, y: 57.69, defaultIcon: "dumbbell" },
  { posIndex: 3, x: 64.57, y: 68.33, defaultIcon: "plus" },
  { posIndex: 4, x: 58.46, y: 82.42, defaultIcon: "key" }
];

// Helper to build learningMapsData from modulData
function buildLearningMapsData(data) {
  const result = {};
  
  // Group by bagian (1..4)
  for (let b = 1; b <= 4; b++) {
    const bagianNodes = data.filter(n => n.bagian === b);
    const firstNode = bagianNodes[0] || { bagianTitle: `Bagian ${b}` };
    
    const levelsObj = {};
    bagianNodes.forEach((node, idx) => {
      const pos = nodePositions[idx] || nodePositions[0];
      const slotNum = idx + 1;
      
      let icon = pos.defaultIcon;
      if (node.type === "kuis-tantangan") icon = "trophy";
      else if (node.type === "bacaan_reflektif") icon = "leaf";
      else if (slotNum === 1) icon = "flag";
      else if (slotNum === 2) icon = "dumbbell";
      else if (slotNum === 3) icon = "plus";
      else if (slotNum === 4) icon = "key";

      levelsObj[slotNum] = {
        nodeId: node.nodeId,
        x: pos.x,
        y: pos.y,
        icon: icon,
        type: node.type,
        title: `Node ${node.nodeId}: ${node.title}`,
        shortTitle: node.title,
        desc: node.bacaan ? node.bacaan.konsepInti : (node.deskripsi || "Selesaikan tantangan ini untuk melanjutkan."),
        xp: node.xp || 12,
        route: (node.type === "kuis-tantangan") ? "tantangan" : "bacaan"
      };
    });

    const startNode = (b - 1) * 4 + 1;
    const endNode = b * 4;

    result[b] = {
      id: b,
      unitSubtitle: `Bagian ${b} • Node ${startNode} - ${endNode}`,
      unitTitle: firstNode.bagianTitle,
      bgImage: "assets/map_bg_current.png",
      levels: levelsObj
    };
  }

  return result;
}

const learningMapsData = (typeof modulData !== "undefined") ? buildLearningMapsData(modulData) : {};

// SVG Icons for Map Nodes
const mapSvgIcons = {
  flag: `<svg class="node-icon-svg" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/></svg>`,
  dumbbell: `<svg class="node-icon-svg" viewBox="0 0 24 24"><rect x="2" y="9" width="3" height="6" rx="1"/><rect x="6" y="6" width="2" height="12" rx="1"/><rect x="8" y="11" width="8" height="2"/><rect x="16" y="6" width="2" height="12" rx="1"/><rect x="19" y="9" width="3" height="6" rx="1"/></svg>`,
  plus: `<svg class="node-icon-svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  key: `<svg class="node-icon-svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V22h8v-7.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm1 11.72V20h-2v-6.28c-.62-.35-1.07-.95-1.07-1.72 0-1.1.9-2 2-2s2 .9 2 2c0 .77-.45 1.37-1.07 1.72z"/></svg>`,
  leaf: `<svg class="node-icon-svg" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 2.22 1.25 4.15 3.09 5.09C6.88 14.16 9.4 9.94 17 8z"/></svg>`,
  star: `<svg class="node-icon-svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  trophy: `<svg class="node-icon-svg" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>`,
  checkmark: `<svg class="node-icon-svg" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`
};

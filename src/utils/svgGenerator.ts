import { BannerDocument, BannerElement } from '../types/banner';

export interface SvgRenderOptions {
  scope?: 'banner' | 'artboard'; // 'banner' = 1584x396, 'artboard' = 2000x2000
  includeWatermark?: boolean;
  uniquePrefix?: string;
}

/**
 * Normalizes any CSS color (including rgba(...), rgb(...), #hex)
 * into standard SVG 1.1 compliant color + opacity attributes.
 * Adobe Illustrator fails when given rgba(...) in fill or stroke attributes.
 */
export function toSvgColor(colorStr?: string): { color: string; opacity?: number } {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'none') {
    return { color: 'none' };
  }

  const trimmed = colorStr.trim();

  // Match rgba(r, g, b, a) or rgb(r, g, b)
  const match = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (match) {
    const r = Math.min(255, parseInt(match[1], 10));
    const g = Math.min(255, parseInt(match[2], 10));
    const b = Math.min(255, parseInt(match[3], 10));
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    return {
      color: hex,
      opacity: Number.isNaN(a) ? 1 : Number(a.toFixed(3)),
    };
  }

  return { color: trimmed };
}

/**
 * Generates valid, self-contained SVG XML string for a BannerDocument.
 * 100% compliant with Adobe Illustrator CC/CS, Figma, Web, and raster engines.
 */
export function generateBannerSvgString(
  banner: BannerDocument,
  options: SvgRenderOptions = {}
): string {
  const { scope = 'banner', uniquePrefix = `b_${banner.id.replace(/[^a-zA-Z0-9]/g, '_')}_` } = options;

  const width = scope === 'artboard' ? banner.artboardWidth : banner.bannerWidth;
  const height = scope === 'artboard' ? banner.artboardHeight : banner.bannerHeight;

  // Offset if rendering the banner inside the 2000x2000 artboard
  const offsetX = scope === 'artboard' ? (banner.artboardWidth - banner.bannerWidth) / 2 : 0;
  const offsetY = scope === 'artboard' ? (banner.artboardHeight - banner.bannerHeight) / 2 : 0;

  // Generate SVG defs (gradients, filters, patterns)
  const defs: string[] = [];

  // 1. Background gradient def
  const bgId = `${uniquePrefix}bg_grad`;
  if (banner.background.type === 'linear-gradient') {
    const angleRad = ((banner.background.gradientAngle - 90) * Math.PI) / 180;
    const x1 = Math.round(50 + Math.cos(angleRad) * 50);
    const y1 = Math.round(50 + Math.sin(angleRad) * 50);
    const x2 = Math.round(50 + Math.cos(angleRad + Math.PI) * 50);
    const y2 = Math.round(50 + Math.sin(angleRad + Math.PI) * 50);

    const stops = banner.background.gradientStops
      .map((s) => {
        const colorParsed = toSvgColor(s.color);
        const stopOpacity = (s.opacity ?? 1) * (colorParsed.opacity ?? 1);
        return `<stop offset="${Math.round(s.offset * 100)}%" stop-color="${colorParsed.color}" stop-opacity="${stopOpacity}" />`;
      })
      .join('\n    ');

    defs.push(`<linearGradient id="${bgId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n    ${stops}\n  </linearGradient>`);
  } else if (banner.background.type === 'radial-gradient') {
    const stops = banner.background.gradientStops
      .map((s) => {
        const colorParsed = toSvgColor(s.color);
        const stopOpacity = (s.opacity ?? 1) * (colorParsed.opacity ?? 1);
        return `<stop offset="${Math.round(s.offset * 100)}%" stop-color="${colorParsed.color}" stop-opacity="${stopOpacity}" />`;
      })
      .join('\n    ');
    defs.push(`<radialGradient id="${bgId}" cx="50%" cy="50%" r="65%" fx="50%" fy="50%">\n    ${stops}\n  </radialGradient>`);
  }

  // 2. Standard SVG 1.1 filters
  defs.push(`
  <filter id="${uniquePrefix}glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="18" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  <filter id="${uniquePrefix}soft_blur" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="28" />
  </filter>
  <clipPath id="${uniquePrefix}banner_clip">
    <rect x="0" y="0" width="${banner.bannerWidth}" height="${banner.bannerHeight}" />
  </clipPath>
  `);

  // Background pattern generator
  const patternMarkup = generatePatternSvg(banner, uniquePrefix);

  // Background fill attribute
  const bgParsed = toSvgColor(banner.background.color);
  const bgFill =
    banner.background.type === 'solid' ? bgParsed.color : `url(#${bgId})`;

  // Elements markup
  const elementsMarkup = banner.elements
    .filter((el) => el.visible !== false)
    .map((el) => renderElementSvg(el, uniquePrefix))
    .join('\n    ');

  // Ambient glow
  const glowParsed = toSvgColor(banner.background.glowColor);
  const glowOpacity = ((banner.background.glowIntensity || 0.5) * 0.45 * (glowParsed.opacity ?? 1)).toFixed(3);

  // Assembling SVG inner banner content
  let innerBannerMarkup = `
    <!-- Inner Banner 1584x396 (4:1 Aspect Ratio) -->
    <g id="banner_content" clip-path="url(#${uniquePrefix}banner_clip)">
      <!-- Background Fill -->
      <rect width="${banner.bannerWidth}" height="${banner.bannerHeight}" fill="${bgFill}" />
      
      <!-- Ambient Glow Overlay if active -->
      ${
        banner.background.glowEffect
          ? `<circle cx="${banner.bannerWidth / 2}" cy="${banner.bannerHeight / 2}" r="${banner.bannerWidth * 0.4}" fill="${glowParsed.color}" opacity="${glowOpacity}" filter="url(#${uniquePrefix}soft_blur)" />`
          : ''
      }

      <!-- Background Texture / Pattern -->
      ${patternMarkup}

      <!-- Banner Elements (Fully editable vector typography & shapes) -->
      ${elementsMarkup}
    </g>
  `;

  if (scope === 'artboard') {
    // 2000x2000 artboard wrapping inner banner in center (Standard SVG 1.1 for Adobe Illustrator & Web)
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${defs.join('\n    ')}
  </defs>

  <!-- Main 2000x2000 Artboard Canvas Background (1:1 Ratio) -->
  <rect width="${width}" height="${height}" fill="#f8fafc" />

  <!-- Subtle Artboard Guide Grid -->
  <g opacity="0.08" stroke="#0f172a" stroke-width="1">
    <line x1="0" y1="${offsetY}" x2="${width}" y2="${offsetY}" stroke-dasharray="6 6" />
    <line x1="0" y1="${offsetY + banner.bannerHeight}" x2="${width}" y2="${offsetY + banner.bannerHeight}" stroke-dasharray="6 6" />
    <line x1="${offsetX}" y1="0" x2="${offsetX}" y2="${height}" stroke-dasharray="6 6" />
    <line x1="${offsetX + banner.bannerWidth}" y1="0" x2="${offsetX + banner.bannerWidth}" y2="${height}" stroke-dasharray="6 6" />
  </g>

  <!-- Soft Vector Drop Shadow Rectangle behind banner (Standard SVG 1.1 for 100% Illustrator compatibility) -->
  <rect x="${offsetX}" y="${offsetY + 12}" width="${banner.bannerWidth}" height="${banner.bannerHeight}" rx="4" fill="#000000" fill-opacity="0.16" />

  <!-- Banner Container in Center (X=${offsetX}, Y=${offsetY}) -->
  <g transform="translate(${offsetX}, ${offsetY})">
    ${innerBannerMarkup}
    <!-- Outer Banner Boundary Line -->
    <rect width="${banner.bannerWidth}" height="${banner.bannerHeight}" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1" />
  </g>
</svg>`;
  }

  // Exact 1584x396 Inner Banner
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${defs.join('\n    ')}
  </defs>
  ${innerBannerMarkup}
</svg>`;
}

function generatePatternSvg(banner: BannerDocument, prefix: string): string {
  const { pattern, patternColor, patternOpacity, patternScale } = banner.background;
  if (!pattern || pattern === 'none' || patternOpacity <= 0) return '';

  const w = banner.bannerWidth;
  const h = banner.bannerHeight;
  const colorObj = toSvgColor(patternColor);
  const effectiveOpacity = ((patternOpacity || 0.3) * (colorObj.opacity ?? 1)).toFixed(3);

  if (pattern === 'dots') {
    const spacing = 36 * (patternScale || 1);
    const cols = Math.ceil(w / spacing);
    const rows = Math.ceil(h / spacing);
    let dots = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots += `<circle cx="${c * spacing + spacing / 2}" cy="${r * spacing + spacing / 2}" r="2" />`;
      }
    }
    return `<g fill="${colorObj.color}" opacity="${effectiveOpacity}">${dots}</g>`;
  }

  if (pattern === 'hexgrid') {
    const s = 40 * (patternScale || 1);
    const cols = Math.ceil(w / (s * 1.5)) + 1;
    const rows = Math.ceil(h / (s * 1.732)) + 1;
    let hexes = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * s * 1.5;
        const cy = r * s * 1.732 + (c % 2 === 1 ? (s * 1.732) / 2 : 0);
        hexes += `<polygon points="${getHexPoints(cx, cy, s * 0.45)}" />`;
      }
    }
    return `<g fill="none" stroke="${colorObj.color}" stroke-width="1" opacity="${effectiveOpacity}">${hexes}</g>`;
  }

  if (pattern === 'diagonal-stripes') {
    return `<g stroke="${colorObj.color}" stroke-width="2" opacity="${effectiveOpacity}">
      ${Array.from({ length: 60 }).map((_, i) => `<line x1="${i * 45 - 200}" y1="0" x2="${i * 45 + 300}" y2="${h}" />`).join('')}
    </g>`;
  }

  if (pattern === 'lowpoly') {
    // Generates 3D polygonal crystalline faceted mesh triangles across banner
    const points: [number, number][] = [
      [0, 0], [200, 0], [450, 0], [700, 0], [950, 0], [1200, 0], [1400, 0], [1584, 0],
      [0, 100], [150, 80], [380, 120], [680, 90], [900, 110], [1150, 80], [1380, 110], [1584, 100],
      [0, 200], [180, 210], [420, 190], [640, 220], [920, 200], [1180, 210], [1420, 190], [1584, 200],
      [0, 300], [220, 310], [450, 290], [710, 310], [960, 290], [1220, 310], [1450, 290], [1584, 300],
      [0, 396], [200, 396], [450, 396], [700, 396], [950, 396], [1200, 396], [1400, 396], [1584, 396],
    ];

    const triangles = [
      [0, 1, 8], [1, 9, 8], [1, 2, 9], [2, 10, 9], [2, 3, 10], [3, 11, 10], [3, 4, 11], [4, 12, 11], [4, 5, 12], [5, 13, 12], [5, 6, 13], [6, 14, 13], [6, 7, 14], [7, 15, 14],
      [8, 9, 16], [9, 17, 16], [9, 10, 17], [10, 18, 17], [10, 11, 18], [11, 19, 18], [11, 12, 19], [12, 20, 19], [12, 13, 20], [13, 21, 20], [13, 14, 21], [14, 22, 21], [14, 15, 22], [15, 23, 22],
      [16, 17, 24], [17, 25, 24], [17, 18, 25], [18, 26, 25], [18, 19, 26], [19, 27, 26], [19, 20, 27], [20, 28, 27], [20, 21, 28], [21, 29, 28], [21, 22, 29], [22, 30, 29], [22, 23, 30], [23, 31, 30],
      [24, 25, 32], [25, 33, 32], [25, 26, 33], [26, 34, 33], [26, 27, 34], [27, 35, 34], [27, 28, 35], [28, 36, 35], [28, 29, 36], [29, 37, 36], [29, 30, 37], [30, 38, 37], [30, 31, 38], [31, 39, 38],
    ];

    const polySvg = triangles
      .map(([i1, i2, i3], idx) => {
        const p1 = points[i1];
        const p2 = points[i2];
        const p3 = points[i3];
        if (!p1 || !p2 || !p3) return '';
        const op = 0.15 + ((idx * 17) % 70) / 100;
        return `<polygon points="${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}" fill="${colorObj.color}" opacity="${(op * patternOpacity).toFixed(3)}" stroke="#ffffff" stroke-opacity="0.08" stroke-width="0.5" />`;
      })
      .join('\n      ');

    return `<g id="${prefix}lowpoly_mesh">${polySvg}</g>`;
  }

  if (pattern === 'stars') {
    const starCount = 45;
    let starSvg = '';
    for (let i = 0; i < starCount; i++) {
      const sx = ((i * 137) % w);
      const sy = ((i * 89) % h);
      const sr = 1 + (i % 3);
      starSvg += `<circle cx="${sx}" cy="${sy}" r="${sr}" />`;
    }
    return `<g fill="${colorObj.color}" opacity="${effectiveOpacity}">${starSvg}</g>`;
  }

  return '';
}

function getHexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function wrapSvgLines(text: string, maxWidth: number, fontSize: number): string[] {
  if (!text) return [];
  const rawParagraphs = text.split('\n');
  const maxChars = Math.max(12, Math.floor(maxWidth / (fontSize * 0.58)));
  const lines: string[] = [];

  for (const para of rawParagraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if ((currentLine + ' ' + word).length <= maxChars) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

function renderElementSvg(el: BannerElement, prefix: string): string {
  const transform = `transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" opacity="${el.opacity ?? 1}"`;

  if (el.type === 'text') {
    const textAnchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
    const posX = el.textAlign === 'center' ? 0 : el.textAlign === 'right' ? (el.width || 600) / 2 : -(el.width || 600) / 2;
    
    // Parse stroke safely
    let strokeAttr = '';
    if (el.stroke && el.stroke !== 'none') {
      const strokeObj = toSvgColor(el.stroke);
      strokeAttr = `stroke="${strokeObj.color}" stroke-width="${el.strokeWidth || 1}" ${strokeObj.opacity !== undefined ? `stroke-opacity="${strokeObj.opacity}"` : ''}`;
    }

    const lines = wrapSvgLines(el.text, el.width || 600, el.fontSize);
    const lineHeight = (el.lineHeight || 1.25) * el.fontSize;
    const totalHeight = Math.max(1, lines.length) * lineHeight;
    const startY = Number((-(totalHeight / 2) + el.fontSize * 0.82).toFixed(1));
    
    // Standard font family string for Illustrator without problematic single quotes
    const cleanFontFamily = `${el.fontFamily}, Plus Jakarta Sans, Arial, Helvetica, sans-serif`;
    const letterSpacingAttr = el.letterSpacing ? `letter-spacing="${el.letterSpacing}px"` : '';
    const fillObj = toSvgColor(el.fill || '#ffffff');
    const fillOpacityAttr = fillObj.opacity !== undefined && fillObj.opacity < 1 ? `fill-opacity="${fillObj.opacity}"` : '';

    // Render single line or multi-line tspan
    let textInner = '';
    if (lines.length <= 1) {
      textInner = escapeXml(lines[0] || el.text || '');
    } else {
      textInner = lines
        .map(
          (line, idx) =>
            `<tspan x="${posX}" dy="${idx === 0 ? 0 : lineHeight.toFixed(1)}">${escapeXml(line)}</tspan>`
        )
        .join('');
    }

    // Direct, 100% visible, fully editable vector <text> node for Adobe Illustrator & Web
    return `
    <g id="${el.id}" ${transform}>
      <text
        x="${posX}"
        y="${startY}"
        text-anchor="${textAnchor}"
        font-family="${cleanFontFamily}"
        font-size="${el.fontSize}"
        font-weight="${el.fontWeight}"
        fill="${fillObj.color}"
        ${fillOpacityAttr}
        ${letterSpacingAttr}
        ${strokeAttr}
        style="font-family: ${cleanFontFamily}; font-size: ${el.fontSize}px; font-weight: ${el.fontWeight}; fill: ${fillObj.color};"
      >${textInner}</text>
    </g>`;
  }

  if (el.type === 'shape') {
    const hw = el.width / 2;
    const hh = el.height / 2;
    const fillObj = toSvgColor(el.fill);
    const fillOpacityAttr = fillObj.opacity !== undefined && fillObj.opacity < 1 ? `fill-opacity="${fillObj.opacity}"` : '';

    let strokeAttr = '';
    if (el.stroke && el.stroke !== 'none') {
      const strokeObj = toSvgColor(el.stroke);
      strokeAttr = `stroke="${strokeObj.color}" stroke-width="${el.strokeWidth || 0}" ${strokeObj.opacity !== undefined ? `stroke-opacity="${strokeObj.opacity}"` : ''} ${el.strokeDasharray ? `stroke-dasharray="${el.strokeDasharray}"` : ''}`;
    }

    if (el.shapeType === 'rectangle') {
      return `
      <g id="${el.id}" ${transform}>
        <rect x="${-hw}" y="${-hh}" width="${el.width}" height="${el.height}" rx="${el.cornerRadius || 0}" fill="${fillObj.color}" ${fillOpacityAttr} ${strokeAttr} />
      </g>`;
    }

    if (el.shapeType === 'circle') {
      const r = Math.min(hw, hh);
      return `
      <g id="${el.id}" ${transform}>
        <circle cx="0" cy="0" r="${r}" fill="${fillObj.color}" ${fillOpacityAttr} ${strokeAttr} />
      </g>`;
    }

    if (el.shapeType === 'ring') {
      const r = Math.min(hw, hh);
      const ringStrokeObj = toSvgColor(el.stroke || el.fill);
      return `
      <g id="${el.id}" ${transform}>
        <circle cx="0" cy="0" r="${r}" fill="none" stroke="${ringStrokeObj.color}" stroke-width="${el.strokeWidth || 12}" ${ringStrokeObj.opacity !== undefined ? `stroke-opacity="${ringStrokeObj.opacity}"` : ''} />
      </g>`;
    }

    if (el.shapeType === 'glow-orb') {
      const r = Math.min(hw, hh);
      return `
      <g id="${el.id}" ${transform}>
        <circle cx="0" cy="0" r="${r}" fill="${fillObj.color}" ${fillOpacityAttr} filter="url(#${prefix}soft_blur)" />
      </g>`;
    }

    if (el.shapeType === 'sparkle') {
      const r = Math.min(hw, hh);
      const d = `M 0 ${-r} Q 0 0 ${r} 0 Q 0 0 0 ${r} Q 0 0 ${-r} 0 Q 0 0 0 ${-r} Z`;
      return `
      <g id="${el.id}" ${transform}>
        <path d="${d}" fill="${fillObj.color}" ${fillOpacityAttr} ${strokeAttr} />
      </g>`;
    }

    if (el.shapeType === 'line') {
      const lineStroke = toSvgColor(el.stroke || el.fill);
      return `
      <g id="${el.id}" ${transform}>
        <line x1="${-hw}" y1="0" x2="${hw}" y2="0" stroke="${lineStroke.color}" stroke-width="${el.strokeWidth || 2}" ${lineStroke.opacity !== undefined ? `stroke-opacity="${lineStroke.opacity}"` : ''} ${el.strokeDasharray ? `stroke-dasharray="${el.strokeDasharray}"` : ''} />
      </g>`;
    }

    if (el.shapeType === 'triangle') {
      const pts = `0,${-hh} ${hw},${hh} ${-hw},${hh}`;
      return `
      <g id="${el.id}" ${transform}>
        <polygon points="${pts}" fill="${fillObj.color}" ${fillOpacityAttr} ${strokeAttr} />
      </g>`;
    }

    if (el.shapeType === 'hexagon') {
      const r = Math.min(hw, hh);
      return `
      <g id="${el.id}" ${transform}>
        <polygon points="${getHexPoints(0, 0, r)}" fill="${fillObj.color}" ${fillOpacityAttr} ${strokeAttr} />
      </g>`;
    }

    // Default polygon / rect fallback
    return `
    <g id="${el.id}" ${transform}>
      <rect x="${-hw}" y="${-hh}" width="${el.width}" height="${el.height}" rx="${el.cornerRadius || 0}" fill="${fillObj.color}" ${fillOpacityAttr} ${strokeAttr} />
    </g>`;
  }

  if (el.type === 'abstract') {
    const hw = el.width / 2;
    const hh = el.height / 2;
    const p1Obj = toSvgColor(el.primaryColor);
    const p2Obj = toSvgColor(el.secondaryColor || '#ffffff');

    if (el.abstractType === 'wave-ribbon') {
      const d1 = `M ${-hw} 0 C ${-hw * 0.3} ${-hh * 0.7}, ${hw * 0.3} ${hh * 0.7}, ${hw} 0 C ${hw * 0.3} ${hh * 0.4}, ${-hw * 0.3} ${-hh * 0.4}, ${-hw} 0 Z`;
      return `
      <g id="${el.id}" ${transform}>
        <path d="${d1}" fill="${p1Obj.color}" opacity="0.45" />
        <path d="M ${-hw} ${hh * 0.2} C ${-hw * 0.3} ${-hh * 0.5}, ${hw * 0.3} ${hh * 0.5}, ${hw} ${-hh * 0.2}" fill="none" stroke="${p2Obj.color}" stroke-width="2" opacity="0.6" />
      </g>`;
    }

    if (el.abstractType === 'particle-cluster') {
      // Dotted wave particle lattice
      const cols = 28;
      const rows = 12;
      let dots = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = -hw + (c / cols) * el.width;
          const wave = Math.sin((c / cols) * Math.PI * 3 + (r / rows) * Math.PI) * 45;
          const py = -hh + (r / rows) * el.height + wave;
          const rad = 1.2 + Math.sin(c * 0.3) * 1;
          const colObj = c % 5 === 0 ? p2Obj : p1Obj;
          dots += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rad.toFixed(1)}" fill="${colObj.color}" />`;
        }
      }
      return `<g id="${el.id}" ${transform}>${dots}</g>`;
    }

    if (el.abstractType === 'mesh-facet') {
      // 3D crystalline facet cluster
      const triangles = [
        `0,0 120,-80 80,60`,
        `80,60 120,-80 220,-20`,
        `80,60 220,-20 180,110`,
        `180,110 220,-20 310,40`,
        `180,110 310,40 260,160`,
        `260,160 310,40 400,120`,
        `260,160 400,120 360,220`,
        `360,220 400,120 480,210`,
      ];
      const polys = triangles
        .map((t, i) => {
          const op = 0.2 + (i % 4) * 0.2;
          const cObj = i % 2 === 0 ? p1Obj : p2Obj;
          return `<polygon points="${t}" fill="${cObj.color}" opacity="${op}" stroke="#ffffff" stroke-opacity="0.15" stroke-width="0.8" />`;
        })
        .join('');
      return `<g id="${el.id}" ${transform}><g transform="translate(${-hw}, ${-hh})">${polys}</g></g>`;
    }

    if (el.abstractType === 'molecular-node') {
      // Cyber nodes network
      const nodes = [
        { x: -hw + 40, y: -hh + 30 },
        { x: -hw + 160, y: -hh + 80 },
        { x: -hw + 110, y: hh - 50 },
        { x: 0, y: -hh + 40 },
        { x: hw - 120, y: -hh + 90 },
        { x: hw - 60, y: hh - 40 },
        { x: -hw + 260, y: 0 },
        { x: hw - 220, y: 20 },
      ];
      const lines = [
        [0, 1], [1, 2], [1, 3], [3, 6], [2, 6], [3, 4], [4, 7], [4, 5], [6, 7]
      ];
      const linesSvg = lines
        .map(([a, b]) => `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="${p2Obj.color}" stroke-width="1.2" opacity="0.6" stroke-dasharray="3 3" />`)
        .join('');
      const nodesSvg = nodes
        .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="4" fill="${p1Obj.color}" /><circle cx="${n.x}" cy="${n.y}" r="8" fill="none" stroke="${p1Obj.color}" stroke-width="1" opacity="0.5" />`)
        .join('');
      return `<g id="${el.id}" ${transform}>${linesSvg}${nodesSvg}</g>`;
    }

    if (el.abstractType === 'glass-card') {
      return `
      <g id="${el.id}" ${transform}>
        <rect x="${-hw}" y="${-hh}" width="${el.width}" height="${el.height}" rx="14" fill="${p1Obj.color}" opacity="0.15" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5" />
      </g>`;
    }
  }

  if (el.type === 'badge') {
    const hw = el.width / 2;
    const hh = el.height / 2;
    const bgObj = toSvgColor(el.backgroundColor || '#6366f1');
    const textObj = toSvgColor(el.textColor || '#ffffff');
    const borderObj = toSvgColor(el.borderColor || 'none');
    const strokeAttr = borderObj.color !== 'none' ? `stroke="${borderObj.color}" stroke-width="${el.borderWidth || 1}" ${borderObj.opacity !== undefined ? `stroke-opacity="${borderObj.opacity}"` : ''}` : '';

    return `
    <g id="${el.id}" ${transform}>
      <rect x="${-hw}" y="${-hh}" width="${el.width}" height="${el.height}" rx="${el.borderRadius || 6}" fill="${bgObj.color}" ${bgObj.opacity !== undefined ? `fill-opacity="${bgObj.opacity}"` : ''} ${strokeAttr} />
      <text x="0" y="${el.fontSize * 0.35}" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="${el.fontSize}" font-weight="600" fill="${textObj.color}" ${textObj.opacity !== undefined ? `fill-opacity="${textObj.opacity}"` : ''} style="font-family: Plus Jakarta Sans, Arial, sans-serif; font-size: ${el.fontSize}px; font-weight: 600; fill: ${textObj.color};">${escapeXml(el.text)}</text>
    </g>`;
  }

  if (el.type === 'image') {
    const hw = el.width / 2;
    const hh = el.height / 2;
    return `
    <g id="${el.id}" ${transform}>
      <image href="${el.src}" x="${-hw}" y="${-hh}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" />
    </g>`;
  }

  return '';
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

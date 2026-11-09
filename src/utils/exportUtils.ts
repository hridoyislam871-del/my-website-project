import { BannerDocument } from '../types/banner';
import { PRESET_TEMPLATES } from '../templates/presetTemplates';
import { generateBannerSvgString } from './svgGenerator';
import JSZip from 'jszip';

export interface ExportResult {
  success: boolean;
  filename: string;
  format: 'svg' | 'jpg' | 'zip';
  width?: number;
  height?: number;
  sizeBytes: number;
  dpi?: number;
  dataUrl?: string;
}

export interface BatchExportOptions {
  scope: 'artboard' | 'banner' | 'both';
  format: 'svg' | 'jpg' | 'both';
  templates?: BannerDocument[];
  quality?: number;
}

/**
 * Downloads the banner as a valid, self-contained vector SVG file.
 */
export async function downloadBannerSvg(
  banner: BannerDocument,
  scope: 'banner' | 'artboard' = 'banner',
  customFilename?: string
): Promise<ExportResult> {
  const width = scope === 'artboard' ? banner.artboardWidth : banner.bannerWidth;
  const height = scope === 'artboard' ? banner.artboardHeight : banner.bannerHeight;

  const svgString = generateBannerSvgString(banner, { scope });
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const filename =
    customFilename ||
    `${sanitizeFilename(banner.name)}_${scope === 'artboard' ? 'artboard_2000x2000' : 'banner_1584x396'}.svg`;

  triggerBrowserDownload(blob, filename);

  return {
    success: true,
    filename,
    format: 'svg',
    width,
    height,
    sizeBytes: blob.size,
  };
}

/**
 * Injects JFIF 300 DPI resolution metadata into a JPEG ArrayBuffer.
 */
export function inject300DpiMetadata(jpegBuffer: ArrayBuffer): Blob {
  const data = new Uint8Array(jpegBuffer);

  // Check SOI marker 0xFF 0xD8
  if (data[0] !== 0xff || data[1] !== 0xd8) {
    return new Blob([jpegBuffer], { type: 'image/jpeg' });
  }

  // Check if JFIF APP0 marker exists at byte 2
  const hasJfif =
    data[2] === 0xff &&
    data[3] === 0xe0 &&
    data[6] === 0x4a && // 'J'
    data[7] === 0x46 && // 'F'
    data[8] === 0x49 && // 'I'
    data[9] === 0x46 && // 'F'
    data[10] === 0x00;

  if (hasJfif) {
    // Modify existing JFIF segment in place
    // byte 13: units (1 = dots per inch)
    data[13] = 0x01;
    // bytes 14-15: Xdensity (300 = 0x012C)
    data[14] = 0x01;
    data[15] = 0x2c;
    // bytes 16-17: Ydensity (300 = 0x012C)
    data[16] = 0x01;
    data[17] = 0x2c;
    return new Blob([data], { type: 'image/jpeg' });
  }

  // If no JFIF APP0 is present, inject the 18-byte JFIF marker right after SOI (byte 2)
  const jfifSegment = new Uint8Array([
    0xff, 0xe0, // APP0 marker
    0x00, 0x10, // Length: 16 bytes
    0x4a, 0x46, 0x49, 0x46, 0x00, // 'JFIF\0'
    0x01, 0x02, // Version 1.02
    0x01, // Units: 1 (dots per inch)
    0x01, 0x2c, // Xdensity: 300
    0x01, 0x2c, // Ydensity: 300
    0x00, // Thumbnail X
    0x00, // Thumbnail Y
  ]);

  const output = new Uint8Array(data.length + jfifSegment.length);
  // SOI (0xFF, 0xD8)
  output[0] = 0xff;
  output[1] = 0xd8;
  // JFIF APP0 segment
  output.set(jfifSegment, 2);
  // Remainder of JPEG stream
  output.set(data.subarray(2), 2 + jfifSegment.length);

  return new Blob([output], { type: 'image/jpeg' });
}

/**
 * Renders a banner SVG onto Canvas and generates a 300-DPI JPEG Blob.
 */
export async function renderBannerToJpegBlob(
  banner: BannerDocument,
  scope: 'banner' | 'artboard' = 'banner',
  quality: number = 0.98
): Promise<Blob> {
  const targetWidth = scope === 'artboard' ? banner.artboardWidth : banner.bannerWidth;
  const targetHeight = scope === 'artboard' ? banner.artboardHeight : banner.bannerHeight;

  const svgString = generateBannerSvgString(banner, { scope });
  const encodedSvg = encodeURIComponent(svgString);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get 2D canvas context');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Background fill
        ctx.fillStyle = scope === 'artboard' ? '#f8fafc' : (banner.background.color || '#000000');
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Draw SVG image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          async (rawJpegBlob) => {
            if (!rawJpegBlob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }

            const buffer = await rawJpegBlob.arrayBuffer();
            const dpi300Blob = inject300DpiMetadata(buffer);
            resolve(dpi300Blob);
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      reject(new Error(`Failed to load SVG for JPG rendering on "${banner.name}"`));
    };

    img.src = dataUrl;
  });
}

/**
 * Downloads the banner as a high-quality JPG image with exact dimensions and 300 DPI metadata.
 */
export async function downloadBannerJpg(
  banner: BannerDocument,
  scope: 'banner' | 'artboard' = 'banner',
  customFilename?: string,
  quality: number = 0.98
): Promise<ExportResult> {
  const targetWidth = scope === 'artboard' ? banner.artboardWidth : banner.bannerWidth;
  const targetHeight = scope === 'artboard' ? banner.artboardHeight : banner.bannerHeight;

  const dpi300Blob = await renderBannerToJpegBlob(banner, scope, quality);

  const filename =
    customFilename ||
    `${sanitizeFilename(banner.name)}_${scope === 'artboard' ? 'artboard_2000x2000' : 'banner_1584x396'}_300dpi.jpg`;

  triggerBrowserDownload(dpi300Blob, filename);

  return {
    success: true,
    filename,
    format: 'jpg',
    width: targetWidth,
    height: targetHeight,
    sizeBytes: dpi300Blob.size,
    dpi: 300,
  };
}

/**
 * BATCH EXPORT: Packages all 10 designs with Full Artboard (2000x2000) and/or Inner Banners (1584x396)
 * into a single comprehensive ZIP file with SVG vectors and 300 DPI JPGs.
 */
export async function downloadAllTemplatesZip(
  options: BatchExportOptions,
  onProgress?: (status: string, percentage: number) => void
): Promise<ExportResult> {
  const zip = new JSZip();
  const templates = options.templates || PRESET_TEMPLATES;
  const total = templates.length;
  const includeArtboard = options.scope === 'artboard' || options.scope === 'both';
  const includeBanner = options.scope === 'banner' || options.scope === 'both';
  const includeSvg = options.format === 'svg' || options.format === 'both';
  const includeJpg = options.format === 'jpg' || options.format === 'both';

  // Subfolders
  const artboardSvgFolder = includeArtboard && includeSvg ? zip.folder('01_Full_Artboards_2000x2000_SVG') : null;
  const artboardJpgFolder = includeArtboard && includeJpg ? zip.folder('02_Full_Artboards_2000x2000_JPG_300DPI') : null;
  const bannerSvgFolder = includeBanner && includeSvg ? zip.folder('03_Inner_Banners_1584x396_SVG') : null;
  const bannerJpgFolder = includeBanner && includeJpg ? zip.folder('04_Inner_Banners_1584x396_JPG_300DPI') : null;

  for (let i = 0; i < total; i++) {
    const tmpl = templates[i];
    const indexStr = String(i + 1).padStart(2, '0');
    const safeName = `${indexStr}_${sanitizeFilename(tmpl.name)}`;

    const currentPercent = Math.round((i / total) * 85);
    onProgress?.(`Processing template ${i + 1} of ${total}: ${tmpl.name}...`, currentPercent);

    // 1. Full Artboard 2000x2000 SVG
    if (artboardSvgFolder) {
      const artboardSvg = generateBannerSvgString(tmpl, { scope: 'artboard' });
      artboardSvgFolder.file(`${safeName}_artboard_2000x2000.svg`, artboardSvg);
    }

    // 2. Inner Banner 1584x396 SVG
    if (bannerSvgFolder) {
      const bannerSvg = generateBannerSvgString(tmpl, { scope: 'banner' });
      bannerSvgFolder.file(`${safeName}_banner_1584x396.svg`, bannerSvg);
    }

    // 3. Full Artboard 2000x2000 300-DPI JPG
    if (artboardJpgFolder) {
      const artboardJpgBlob = await renderBannerToJpegBlob(tmpl, 'artboard', options.quality || 0.98);
      const artboardBuffer = await artboardJpgBlob.arrayBuffer();
      artboardJpgFolder.file(`${safeName}_artboard_2000x2000_300dpi.jpg`, artboardBuffer);
    }

    // 4. Inner Banner 1584x396 300-DPI JPG
    if (bannerJpgFolder) {
      const bannerJpgBlob = await renderBannerToJpegBlob(tmpl, 'banner', options.quality || 0.98);
      const bannerBuffer = await bannerJpgBlob.arrayBuffer();
      bannerJpgFolder.file(`${safeName}_banner_1584x396_300dpi.jpg`, bannerBuffer);
    }
  }

  // Add Readme text file inside zip explaining specifications
  zip.file(
    'SPECIFICATIONS_AND_USAGE.txt',
    `ABSTRACT BANNER DESIGN STUDIO - COMPLETE MASTER PACK
===================================================

Dimensions:
- Main Artboard: 2000 x 2000 px (1:1 Aspect Ratio)
- Inner Banner: 1584 x 396 px (4:1 Aspect Ratio)

File Standards:
- SVG: Valid scalable vector format (opens in Illustrator, Inkscape, Figma, Web)
- JPG: Rendered with embedded 300 DPI JFIF metadata for high-resolution print and screen display.

All 10 handcrafted templates included:
01. Abstract Blue Gradient
02. Pink Gradient Abstract
03. Orange & Yellow Creative
04. Minimal White Design
05. Purple Luxury Design
06. Green & Gold Abstract
07. Dark Blue Technology
08. Colorful Geometric Design
09. Pastel Gradient Design
10. Modern Multi-Color Design
`
  );

  onProgress?.('Compressing Master ZIP Archive...', 90);

  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(`Compressing ZIP: ${Math.round(metadata.percent)}%`, 90 + Math.round(metadata.percent * 0.1));
  });

  const zipFilename = `Abstract_Banner_Studio_10_Templates_${
    includeArtboard ? 'Full_Artboard_' : ''
  }Master_Pack.zip`;

  triggerBrowserDownload(zipBlob, zipFilename);
  onProgress?.('Complete! Downloading ZIP...', 100);

  return {
    success: true,
    filename: zipFilename,
    format: 'zip',
    sizeBytes: zipBlob.size,
  };
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFilename(name: string): string {
  return (name || 'banner')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);
}

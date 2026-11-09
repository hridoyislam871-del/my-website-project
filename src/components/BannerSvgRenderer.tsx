import React, { useMemo } from 'react';
import { BannerDocument, BannerElement } from '../types/banner';
import { generateBannerSvgString } from '../utils/svgGenerator';

interface BannerSvgRendererProps {
  banner: BannerDocument;
  scope?: 'banner' | 'artboard';
  className?: string;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string) => void;
  interactive?: boolean;
}

export const BannerSvgRenderer: React.FC<BannerSvgRendererProps> = ({
  banner,
  scope = 'banner',
  className = '',
  selectedElementId,
  onSelectElement,
  interactive = false,
}) => {
  const width = scope === 'artboard' ? banner.artboardWidth : banner.bannerWidth;
  const height = scope === 'artboard' ? banner.artboardHeight : banner.bannerHeight;

  // Generate SVG string
  const svgString = useMemo(() => {
    return generateBannerSvgString(banner, {
      scope,
      uniquePrefix: `ui_${banner.id.replace(/[^a-zA-Z0-9]/g, '_')}_`,
    });
  }, [banner, scope]);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: '100%',
        aspectRatio: `${width} / ${height}`,
      }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

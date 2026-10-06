import { useEffect, useState } from 'react';
const BaseVectorMap = ({
  width,
  height,
  options,
  type
}) => {
  const [selectorId] = useState(() => type + Date.now());
  const [map, setMap] = useState();
  useEffect(() => {
    if (!map) {
      // create jsvectormap
      const map = new window['jsVectorMap']({
        selector: '#' + selectorId,
        map: type,
        onRegionTooltipShow: (tooltip, code) => {
          if (type === 'world' && /^[A-Z]{2}$/.test(code)) {
            tooltip.text(new Intl.DisplayNames(['es'], { type: 'region' }).of(code));
          }
        },
        ...options
      });
      setMap(map);
    }
  }, [selectorId, map, options, type]);
  return <>
      <section id={selectorId} aria-label="Mapa interactivo" style={{
      width: width,
      height: height
    }}></section>
    </>;
};
export default BaseVectorMap;
import React from 'react';
import { ResponsiveContainer } from 'recharts';

interface StableResponsiveContainerProps {
  children: React.ReactElement;
}

export const StableResponsiveContainer: React.FC<StableResponsiveContainerProps> = ({ children }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0 }}>
      {size.width > 1 && size.height > 1 ? (
        <ResponsiveContainer width={size.width} height={size.height}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
};

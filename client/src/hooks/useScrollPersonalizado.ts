// src/hooks/useScrollPersonalizado.ts
import { useRef, useEffect } from "react";

const ocultarScroll = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    WebkitScrollbar: 'none',
} as React.CSSProperties;

/**
 * Hook personalizado para scroll vertical con rueda del mouse
 * @returns {Object} { scrollRef, estilosScroll }
 * 
 * @example
 * const { scrollRef, estilosScroll } = useScrollPersonalizado();
 * 
 * return (
 *   <div ref={scrollRef} style={estilosScroll} className="overflow-y-auto h-full">
 *     {items.map(item => <p>{item}</p>)}
 *   </div>
 * )
 */
export const useScrollPersonalizado = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            const manejarRueda = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollTop += e.deltaY * 1.2;
            };
            el.addEventListener("wheel", manejarRueda, { passive: false });
            return () => el.removeEventListener("wheel", manejarRueda);
        }
    }, []);

    return { scrollRef, estilosScroll: ocultarScroll };
};
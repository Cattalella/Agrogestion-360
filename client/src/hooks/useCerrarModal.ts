// src/hooks/useCerrarModal.ts
import { useEffect, type RefObject } from "react";

/**
 * Hook personalizado para cerrar un modal al hacer clic fuera de él
 * @param isOpen - Estado que indica si el modal está abierto
 * @param modalRef - Referencia al elemento del modal
 * @param onClose - Función para cerrar el modal
 * 
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * useCerrarModal(isOpen, modalRef, () => setIsOpen(false));
 * 
 * return (
 *   {isOpen && (
 *     <div ref={modalRef}>
 *       <p>Contenido del modal</p>
 *     </div>
 *   )}
 * )
 */
export const useCerrarModal = (
    isOpen: boolean,
    modalRef: RefObject<HTMLElement | null>,
    onClose: () => void
) => {
    useEffect(() => {
        const manejarClicAfuera = (event: MouseEvent) => {
            const target = event.target as Node;
            if (isOpen && modalRef.current && !modalRef.current.contains(target)) {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', manejarClicAfuera);
        return () => document.removeEventListener('mousedown', manejarClicAfuera);
    }, [isOpen, modalRef, onClose]);
};
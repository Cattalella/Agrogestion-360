import { useState } from 'react';

// Estructura para el registro financiero de salidas
interface Venta {
    id: number;
    animal: string;   // Referencia al ID local
    cliente: string;  // Nombre del comprador o feria
    fecha: string;    // Fecha de la transacción
    monto: string;    // Valor de la venta (formato moneda)
}

export const useVentas = (listaInicial: Venta[]) => {
    // 1. Estados de Datos
    const [listaVentas, setListaVentas] = useState<Venta[]>(listaInicial);

    // 2. Estados de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    // 3. Handlers de Interfaz
    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    // 4. Lógica de Negocio: Transacciones
    const guardarVenta = (nuevaVenta: any) => {
        // Aquí es donde en el futuro Prisma restará el animal del inventario activo
        console.log("Procesando venta y actualizando estado del animal...", nuevaVenta);
        
        // Simulación: Cerramos y volvemos al historial
        setIsModalOpen(false);
        setVista('lista');
    };

    return {
        listaVentas,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarVenta
    };
};
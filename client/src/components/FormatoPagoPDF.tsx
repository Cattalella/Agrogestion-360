// components/FormatoPagoPDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { FormatoPago } from '../hooks/useGenerarPagoPDF';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        marginBottom: 30,
        borderBottom: 1,
        paddingBottom: 10,
    },
    titulo: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitulo: {
        fontSize: 10,
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        width: 120,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    firma: {
        marginTop: 40,
        borderTopWidth: 1,
        paddingTop: 20,
        alignItems: 'center',
    },
    firmaLinea: {
        width: 200,
        marginTop: 10,
    },
});

export const FormatoPagoPDF = ({ data }: { data: FormatoPago }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Encabezado */}
            <View style={styles.header}>
                <Text style={styles.titulo}>FORMATO DE PAGO</Text>
                <Text style={styles.subtitulo}>Trabajador - Finca Agrícola</Text>
                <Text style={styles.subtitulo}>Fecha: {new Date(data.fechaGeneracion).toLocaleDateString()}</Text>
            </View>

            {/* Datos del trabajador */}
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>DATOS DEL TRABAJADOR</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nombre:</Text>
                    <Text>{data.detalles.nombreTrabajador}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tipo de trabajo:</Text>
                    <Text>{data.detalles.tipoTrabajo}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Período:</Text>
                    <Text>{data.detalles.periodo}</Text>
                </View>
            </View>

            {/* Actividades realizadas */}
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>ACTIVIDADES REALIZADAS</Text>
                {data.detalles.actividades.map((act, idx) => (
                    <View key={idx} style={styles.row}>
                        <Text>• {act}</Text>
                    </View>
                ))}
            </View>

            {/* Monto */}
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>MONTO A PAGAR</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Monto total:</Text>
                    <Text>${data.detalles.montoTotal.toLocaleString()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>En letras:</Text>
                    <Text>{data.detalles.montoLetras}</Text>
                </View>
            </View>

            {/* Firma */}
            <View style={styles.firma}>
                <Text>_________________________</Text>
                <Text style={styles.firmaLinea}>Firma del trabajador</Text>
                <Text style={{ fontSize: 9, marginTop: 20, color: '#999' }}>
                    El pago en efectivo solo se registrará después de firmar este formato.
                </Text>
            </View>
        </Page>
    </Document>
);
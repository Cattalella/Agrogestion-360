import { Navbar } from "../components/Navbar"
import { InfoText } from "../components/InfoText"
import { Imgs } from "../components/Imgs"
import trabajo1 from '../assets/imgs/download.jpg'
import trabajo2 from '../assets/imgs/campo-2.jpg'
import trabajo3 from '../assets/imgs/campo-3.jpg'
import trabajo4 from '../assets/imgs/campo-4.jpg'
import imgInfo from '../assets/imgs/imgInfo.jpg'
import { Cards } from "../components/Cards"
import quimico from '../assets/imgs/quimico.webp'
import insecto from '../assets/imgs/insecto.webp'
import gota from '../assets/imgs/gota.webp'
import copy from '../assets/imgs/copy.webp'
import footer from '../assets/imgs/footer.webp'

const Hero2 = () => {/* hero 2 */
    return (
        <section className="flex
            mt-[5rem] w-full max-w-[80rem] 
            gap-[5rem] mx-auto items-start pb-[5rem] border-b-2 border-y-blue-950"> {/* contenedor hero, para texto e imagenes */}

            <article className="flex-1 text-justify space-y-[1.3rem]"> {/* contenedor de los textos principales */}

                <div className=""> {/* ¿Qué es AgroGestión 360? */}
                    <InfoText 
                    texto="¿Qué Es AgroGestión-360?" estiloT="text-[1.5rem]"
                    texto2="Es un plataforma diseñada para integrar la gestión Agrícola
                    y Ganadera de la finca integral en un solo lugar. Facilitando el control
                    de procesos, la toma de decisiones y el aumento de la productividad."
                    />
                </div>

                <div className=""> {/* Módulos principales */}
                    <InfoText 
                    texto="Módulos Pincipales" estiloT="text-[1.5rem]"
                    texto2="Agricultura: Siembra, Fumigación, Recolección y Control de Plagas."
                    />
                    <InfoText 
                    texto2="Ganadería: Vacunación, Control de peso, Reproducción e Inventario de Ganado."
                    />
                    <InfoText 
                    texto2="Inventario y Suministros: Fertilizantes, Alimentos y Herramientas."
                    />
                    <InfoText 
                    texto2="Gestión Administrativa: Roles, Usuarios, Reportes e Informes."
                    /> 
                </div>

                <div className=""> {/* Beneficios */}
                    <InfoText 
                    texto="Beneficios"  estiloT="text-[1.5rem]"
                    />
                    <InfoText 
                    texto2="Mayor Control y Organización."
                    />
                    <InfoText 
                    texto2="Ahorro de Tiempo y Recursos."
                    />
                    <InfoText 
                    texto2="Acceso Rápido a Reportes."
                    />
                    <InfoText 
                    texto2="Gestión Centralizada de Porcesos."
                    />
                </div>
                
                </article>

                <article className="bg-black w-[34rem] p-1 overflow-hidden"> {/* contenedor para las imáges, cuadro estático */}
                    <div className="flex w-full h-[23rem] gap-1"> {/* contenedor para las imáges, cuadro en movimiento */}

                        <div className="w-[70rem] h-auto"> {/* img-1 */}
                        <Imgs
                        estilos="rounded-[10px]"
                        alt="hola"
                        url={trabajo1}
                        />
                        </div>
                        
                        <div className="w-[30rem]"> {/* img-2 */}
                        <Imgs 
                        url={trabajo2}
                        estilos="rounded-[10px]"
                        alt=""
                        />
                        </div>

                        <div className="w-[20rem]"> {/* img-3 */}
                        <Imgs 
                        url={trabajo3}
                        alt="Imagen"
                        estilos="rounded-[10px]"
                        />
                        </div>

                        <div className=""> {/* img-4 */}
                        <Imgs 
                        url={trabajo4}
                        alt=""
                        estilos="rounded-[10px]"
                        />
                        </div>
                    </div>
                </article>
            </section>
    );
};

const Hero3 = () => { /* hero 3 */
    return (
        <section className="flex
            mt-[8rem] w-full max-w-[78rem] items-center border-b-2 border-y-blue-950 pb-[5rem]
            gap-[4rem] mx-auto items-start pb-[5rem] justify-center"> {/* hero 3 */}
            
            <article className="flex-1 w-full font-[yusei]"> {/* titulo y texyo */}
                <p className="mb-[2rem] text-[4rem]">
                Comprometidos Con <br />
                La Sostenibilidad <br />
                Agrícola & Pecuaria
                </p>

                <p className="w-[33rem]">
                <InfoText
                texto2="En AgroGestión-360 promovemos el uso
                responsable de insumos, insecticides, 
                fungicidas y herbicidas. Priorizando prácticas
                quee protejan la biodiversidad, el suelo y
                los recursos hídricos. Nuestro sistema integra
                recomendaciones para el manejo adecuado
                de productos químicos, fomentando la rotación
                de activos y el respeto por los ciclos naturales."
                icons="leading-[2.5rem]"
                />
                </p>
                
            </article>

            <article className="flex w-[33rem] h-[35.4rem]"> {/* imagen */}
                <Imgs 
                alt="Fotografía"
                url={imgInfo}
                estilos="w-full rounded-[1rem]"
                />
            </article>
        </section>
    );
};

const Hero4 = () => { /* hero 4 */
    return (
        <section className="flex flex-col 
            mt-[8rem] w-full max-w-[80rem] 
            gap-[2.5rem] mx-auto pb-[5rem] border-b-2 border-y-blue-950">
                
                <div className="flex justify-end">
                <InfoText 
                texto="Buenas Prácticas Agrícolas & Pecuarias"
                icons="text-[2.3rem]"
                />
                </div>

                <section className="flex justify-center font-[yusei] gap-6"> {/* cards */}
                    <article className=""> {/* químicos */}
                        <Cards
                        titulo="Uso Racional De 
                        Fertilizantes & Agroquímicos" 
                        estilosT="text-[2.3rem] font-bold"

                        parrafos="Aplicación precisa para 
                        maximizar el rendimiento
                        de la tierra sin 
                        desperdicios."
                        estilosP="leading-[2.5rem] mt-6 text-[1.4rem] "
                        >
                            <img 
                            src={quimico} 
                            alt="" 
                            className="w-20 mb-5"
                            />
                        </Cards>
                    </article>

                    <article className=""> {/* insecto */}
                        <Cards
                        titulo="Manejo Integrado 
                        De Plagas" 
                        estilosT="text-[2.3rem] font-bold"

                        parrafos="Prevención y control
                        biológicos para proteger
                        la sanidad de los
                        cultivos con el mínimo
                        impacto químico."
                        estilosP="leading-[2.5rem] mt-6 text-[1.4rem] "
                        >
                            <img 
                            src={insecto} 
                            alt="" 
                            className="w-20 mb-5"
                            />
                        </Cards>
                    </article>

                    <article className=""> {/* agua */}
                        <Cards
                        titulo="Conservación De
                        Fuentes De Agua" 
                        estilosT="text-[2.3rem] font-bold"

                        parrafos="Monitoreo y manejo
                        responsable del agua 
                        para asegurar el
                        abastecimiento
                        constante y líquido."
                        estilosP="leading-[2.5rem] mt-6 text-[1.4rem] "
                        >
                            <img 
                            src={gota} 
                            alt="" 
                            className="w-20 mb-5"
                            />
                        </Cards>
                    </article>
                </section>
        </section>
    )
}

const Footer = () => {
    return (
        <footer className="flex flex-col
            mt-[10rem] w-full
            gap-[6rem] mx-auto pb-[5rem] bg-center bg-cover bg-no-repeat" 
            style={{ backgroundImage: `url(${footer})` }}>
            
            <div className="font-[yusei] mt-5">
                <p className="flex justify-center w-full max-w-[80rem]">
                -- Sembrando Técnología, Cosechando Resultados --
                </p>
            </div>

            <div className="flex gap-[15rem] justify-center p-4">

            <div className="flex flex-col w-full max-w-[36rem]">
            <div className="flex gap-3 w-full max-w-[35rem]">
                <InfoText 
                texto="Centro de Ayuda:"
                texto2="Guías de usurio para gestión y reportes."
                />
            </div>
            <div className="flex  gap-3 w-full max-w-[35rem]">
                <InfoText 
                texto="Asistencia Técnica:"
                texto2="Reporte de incidencias y soporte de base de datos."
                />
            </div>
            <div className="flex  gap-3 w-full max-w-[35rem]">
                <InfoText 
                texto="Manuales de Rol:"
                texto2="Tutoriales para Administradores / Dueños."
                />
            </div>
            <div className="flex  gap-3 w-full max-w-[35rem]">
                <InfoText 
                texto="Contacto Directo:"
                texto2="Soporte técnico: agrosoporte@gmail.com."
                />
            </div>
            </div>

            <div className="">
            <p className="font-[yusei]">AgroGestión-360 Innovación <br /> 
            digital para el sector agropecuario. <br />
            Gestión de tranzabilidad, control de <br />
            insumos y análisis financieros en un solo lugar.
            </p>
            </div>
            </div>

            <div className="flex justify-center items-center gap-2">
            <p> -- </p>
            <img src={copy} alt="Copyrigth" className="w-[1rem] -translate-y-[3px]"/>
                <p className="font-[yusei] font-bold">
                    2026 Agrogestión_360 - Políticas de Privacidad - Terminos & Condiciones
                </p>
                <p> -- </p>
            </div>

        </footer>
    )
}

export const Informacion = () => { /*  */
    return (
        <div className="">
            <Navbar estilos="mt-[0.6rem]
            bg-gradient-to-r from-[var(--color-verdeInfo)]
            to-[var(--color-amarilloInfo)] text-black
            "
            />
    
            <Hero2 />
            <Hero3 />
            <Hero4 />
            <Footer/>
        </div>
    );
};




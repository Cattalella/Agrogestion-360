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
import footer from '../assets/imgs/footer.png'

const Hero2 = () => {
    return (
        <section className="flex border-solid border-2 
            rounded-[2rem] mt-[2.5rem] w-full max-w-[80rem] 
            gap-[5rem] mx-auto items-start p-7"> {/* contenedor hero, para texto e imagenes */}

            <article className="flex-1 bg-amber-100 text-justify space-y-[1.3rem] "> {/* contenedor de los textos principales */}

                <div className=""> {/* ¿Qué es AgroGestión 360? */}
                    <InfoText 
                    texto="¿Qué Es AgroGestión-360?"
                    texto2="Es un plataforma diseñada para integrar la gestión Agrícola
                    y Ganadera de la finca integral en un solo lugar. Facilitando el control
                    de procesos, la toma de decisiones y el aumento de la productividad."
                    />
                </div>

                <div className=""> {/* Módulos principales */}
                    <InfoText 
                    texto="Módulos Pincipales"
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
                    texto="Beneficios"
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

                <article className="bg-black w-[33rem] p-1 overflow-hidden"> {/* contenedor para las imáges, cuadro estático */}
                    <div className="flex bg-blue-600 w-full h-[23rem]"> {/* contenedor para las imáges, cuadro en movimiento */}

                        <div className=""> {/* img-1 */}
                        <Imgs
                        estilos=""
                        alt="hola"
                        url={trabajo1}
                        />
                        </div>
                        <div className=""> {/* img-2 */}
                        <Imgs 
                        url={trabajo2}
                        estilos=""
                        alt=""
                        />
                        </div>
                        <div className=""> {/* img-3 */}
                        <Imgs 
                        url={trabajo3}
                        alt="Imagen"
                        estilos=""
                        />
                        </div>
                        <Imgs 
                        url={trabajo4}
                        alt=""
                        estilos=""
                        />
                    </div>
                </article>
            </section>
    );
};

const Hero3 = () => { /* hero 3 */
    return (
        <section className="flex border-solid border-2 
            rounded-[2rem] mt-[2.5rem] w-full max-w-[80rem] 
            gap-[4rem] mx-auto items-start p-7 justify-center"> {/* hero 3 */}
            
            <article className="flex-1 bg-amber-100 w-full max-w-[43rem]"> {/* titulo y texyo */}
                <p>
                <InfoText 
                texto="Comprometidos Con La Sostenibilidad Agrícola & Pecuaria"
                icons="text-[4.5rem] italic mb-[2rem]"
                />
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

            <article className="flex w-[30rem] h-[35.4rem]"> {/* imagen */}
                <Imgs 
                alt="Fotografía"
                url={imgInfo}
                estilos="w-full rounded-[2rem]"
                />
            </article>
        </section>
    );
};

const Hero4 = () => { /* hero 4 */
    return (
        <section className="flex flex-col border-solid border-2 
            rounded-[2rem] mt-[2.5rem] w-full max-w-[80rem] 
            gap-[2.5rem] mx-auto p-7">
                
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
        <footer className="flex flex-col border-solid border-2 
            rounded-[2rem] mt-[2.5rem] w-full max-w-[80rem] 
            gap-[2.5rem] mx-auto p-7">

            <p className="flex justify-end bg-amber-200 w-full max-w-[80rem]">
                -- Sembrando Técnología, Cosechando Resultados --
            </p>
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




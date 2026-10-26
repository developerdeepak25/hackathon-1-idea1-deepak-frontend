import type { Copy } from "./types";

export const es: Copy = {
  meta: {
    title: "Iturrieta",
    description:
      "Sagardotegia en el valle de Aramaio. Comida de jueves a domingo, y reserva de mesa.",
  },
  nav: {
    house: "La casa",
    menu: "Menú",
    gatherings: "Encuentros",
    book: "Reservar mesa",
    open: "Menú",
    close: "Cerrar",
  },
  hero: {
    eyebrow: "Sagardotegia · Aramaio",
    established: "Desde 1998",
    lede: "Una granja familiar y sidrería en el valle de Aramaio, a media hora de Vitoria. Cultivan sus manzanas ecológicas y escancia su propia sidra natural.",
    book: "Reservar mesa",
    menu: "Ver el menú",
  },
  facts: [
    { label: "Desde", value: "1998" },
    { label: "Temporada de txotx", value: "Enero a mayo" },
    { label: "Abierto", value: "Jue–Dom, 13:00–16:00" },
    { label: "Manzanal", value: "1.400 manzanos" },
  ],
  lunch: {
    eyebrow: "La comida",
    title: "Un menú, dos precios",
    body: "De jueves a domingo, de 13:00 a 16:00. La cocina prepara un solo menú. La sidra se escancia del kupela.",
  },
  menuItems: [
    { name: "Adultos", note: "La comida completa y la sidra", price: "€45" },
    { name: "Niños", note: "La misma mesa, un plato más pequeño", price: "€16" },
  ],
  gatherings: {
    eyebrow: "Encuentros",
    title: "Conciertos y visitas",
    empty:
      "Aún no hay nada publicado. Los conciertos y las visitas a la granja aparecerán aquí cuando la casa los publique.",
  },
  footer: { place: "Sagardotegia en el valle de Aramaio, cerca de Vitoria." },
  book: {
    eyebrow: "Reservas",
    title: "Reservar una mesa",
    body: "El formulario de reserva es la siguiente parte de este sitio. La comida es de jueves a domingo, de 13:00 a 16:00. El menú cuesta 45 € para adultos y 16 € para niños.",
    back: "Volver a la casa",
  },
};

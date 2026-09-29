// Namespace "home". Mantener las mismas claves en es y en.
const es = {
  // Etiquetas cortas del layout que no están en common
  layout: {
    book: 'Reservar',
    followUs: 'Síguenos',
    call: 'Llamar',
  },
  seo: {
    title: 'Renta de autos en Guayaquil',
    description:
      'Alquiler de autos en Guayaquil con entrega en aeropuerto y hotel. Reserva en línea o con la ayuda de un asesor en minutos.',
  },
  hero: {
    eyebrow: 'Renta de autos · Guayaquil',
    title: 'Tu próximo vehículo en minutos',
    subtitle: 'Alquiler de autos en Guayaquil. Entrega en aeropuerto y hotel.',
    trust: {
      airport: 'Entrega en aeropuerto',
      condition: 'Autos en excelente estado',
      secure: 'Reserva segura',
    },
    scroll: 'Descubre más',
  },
  routes: {
    label: 'Elige cómo quieres reservar',
    a: {
      tag: 'Con asesor',
      title: 'Ayúdame a elegir',
      text: 'Responde 3 preguntas y te asesoramos.',
    },
    b: {
      tag: 'En línea',
      title: 'Reservar directamente',
      text: 'Ya sé lo que quiero. Reserva y paga en línea.',
    },
  },
  categories: {
    eyebrow: 'Flota',
    title: 'Explora nuestras categorías',
    subtitle: 'Desde un económico para la ciudad hasta una van para todo el grupo.',
    passengers: '{n} pasajeros',
    luggage: '{n} maletas',
    automatic: 'Automático',
    manual: 'Manual',
    book: 'Reservar',
    empty: 'Pronto verás aquí nuestras categorías.',
    error: 'No pudimos cargar las categorías.',
    swipe: 'Desliza para ver más',
  },
  steps: {
    eyebrow: 'Así de simple',
    title: 'Cómo funciona',
    s1: { title: 'Elige tu camino', text: 'Te ayudamos a elegir o reservas tú mismo en línea.' },
    s2: { title: 'Dinos cuándo y dónde', text: 'Fecha, hora y lugar de entrega. Nada más.' },
    s3: { title: 'Recibe tu vehículo', text: 'En el aeropuerto, tu hotel o nuestra oficina. Listo para rodar.' },
  },
  airport: {
    eyebrow: 'Aeropuerto José Joaquín de Olmedo',
    title: 'Aterriza y tu auto ya te espera',
    text: 'Te entregamos el vehículo a la salida de tu vuelo en Guayaquil, listo para rodar.',
    p1: 'Coordinamos la entrega con tu hora de llegada',
    p2: 'Te entregamos el auto en persona',
    p3: 'Sin filas ni trámites de mostrador',
    cta: 'Alquiler en el aeropuerto',
  },
  sections: {
    eyebrow: 'Más de Ponce’s',
    title: 'Todo para moverte mejor',
    business: 'Alquiler corporativo y flotas',
    promotions: 'Ofertas de la temporada',
    hotels: 'Beneficios en hoteles aliados',
    guides: 'Rutas y destinos desde Guayaquil',
    renaissance: 'Nuestro club de viajeros',
  },
  trust: {
    eyebrow: 'Sin letra pequeña',
    title: 'Alquilar aquí es más fácil',
    guarantee: {
      title: 'Garantía clara',
      text: 'Se gestiona con Datafast al retirar el vehículo. No se cobra en línea.',
      amount: 'Garantía de {amount}, gestionada con Datafast al retirar. No se cobra en línea.',
    },
    price: { title: 'Sin costos sorpresa', text: 'Ves el total antes de pagar: días, kilometraje, cobertura y extras.' },
    secure: { title: 'Pago seguro', text: 'Paga en línea con tarjeta a través de una pasarela certificada.' },
    human: { title: 'Personas reales', text: 'Un asesor te acompaña por WhatsApp o teléfono, antes y durante tu viaje.' },
  },
  final: {
    title: '¿Prefieres hablar con alguien?',
    text: 'Una llamada o un mensaje y un asesor deja tu auto listo.',
    whatsappMessage: 'Hola, quiero información para alquilar un vehículo en Guayaquil.',
  },
}

const en: typeof es = {
  layout: {
    book: 'Book',
    followUs: 'Follow us',
    call: 'Call',
  },
  seo: {
    title: 'Car rental in Guayaquil',
    description:
      'Rent a car in Guayaquil with airport and hotel delivery. Book online or with the help of an agent in minutes.',
  },
  hero: {
    eyebrow: 'Car rental · Guayaquil',
    title: 'Rent a car in Guayaquil without the hassle.',
    subtitle: 'Fast booking. Personal assistance. Airport delivery available.',
    trust: {
      airport: 'Airport delivery',
      condition: 'Cars in excellent condition',
      secure: 'Secure booking',
    },
    scroll: 'Discover more',
  },
  routes: {
    label: 'Choose how you want to book',
    a: {
      tag: 'With an agent',
      title: 'Help me choose',
      text: "Answer 3 quick questions and we'll help you find the right vehicle.",
    },
    b: {
      tag: 'Online',
      title: 'Book online',
      text: 'Choose a vehicle category and complete your reservation online.',
    },
  },
  categories: {
    eyebrow: 'Fleet',
    title: 'Explore our categories',
    subtitle: 'From a compact for the city to a van for the whole group.',
    passengers: '{n} passengers',
    luggage: '{n} bags',
    automatic: 'Automatic',
    manual: 'Manual',
    book: 'Book',
    empty: 'Our categories will show up here soon.',
    error: "We couldn't load the categories.",
    swipe: 'Swipe to see more',
  },
  steps: {
    eyebrow: 'That simple',
    title: 'How it works',
    s1: { title: 'Pick your path', text: 'We help you choose, or you book online on your own.' },
    s2: { title: 'Tell us when and where', text: 'Date, time and delivery place. That’s it.' },
    s3: { title: 'Get your vehicle', text: 'At the airport, your hotel or our office. Ready to go.' },
  },
  airport: {
    eyebrow: 'José Joaquín de Olmedo Airport',
    title: 'Land, and your car is waiting',
    text: 'We hand you the vehicle right outside arrivals in Guayaquil, ready to go.',
    p1: 'Delivery timed to your arrival',
    p2: 'We hand you the car in person',
    p3: 'No lines, no counter paperwork',
    cta: 'Airport car rental',
  },
  sections: {
    eyebrow: 'More from Ponce’s',
    title: 'Everything to move better',
    business: 'Corporate rentals and fleets',
    promotions: 'This season’s deals',
    hotels: 'Perks at partner hotels',
    guides: 'Routes and trips from Guayaquil',
    renaissance: 'Our travelers club',
  },
  trust: {
    eyebrow: 'No fine print',
    title: 'Renting here is easier',
    guarantee: {
      title: 'Clear security deposit',
      text: 'Handled with Datafast when you pick up the car. Nothing is charged online.',
      amount: '{amount} security deposit, handled with Datafast at pickup. Nothing is charged online.',
    },
    price: { title: 'No surprise fees', text: 'See the full total before paying: days, mileage, coverage and extras.' },
    secure: { title: 'Secure payment', text: 'Pay online by card through a certified payment gateway.' },
    human: { title: 'Real people', text: 'An agent helps you by WhatsApp or phone, before and during your trip.' },
  },
  final: {
    title: 'Rather talk to someone?',
    text: 'One call or message and an agent gets your car ready.',
    whatsappMessage: "Hi, I'd like information about renting a vehicle in Guayaquil.",
  },
}

export default { es, en }

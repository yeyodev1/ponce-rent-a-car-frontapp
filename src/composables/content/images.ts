/**
 * Fotos decorativas de Unsplash (verificadas con HTTP 200). Son de respaldo
 * mientras el cliente entrega fotos propias; reemplazar aquí en un solo lugar.
 */
const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`

export const IMAGES = {
  airport: u('1464037866556-6812c9d1c72e'),
  business: u('1486406146926-c627a92ad1ab'),
  partner: u('1521791136064-7986c2920216'),
  hotels: u('1542314831-068cd1dbfeeb'),
  contact: u('1423666639041-f56000c27a9a'),
  guides: u('1476514525535-07fb3b4ae5f1'),
  city: u('1449965408869-eaa3f722e40d'),
  suv: u('1519641471654-76ce0107ad1b'),
  trucks: u('1559416523-140ddc3d238c'),
  longTerm: u('1469854523086-cc02fe5d8800'),
}

export const AIRPORT_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Aeropuerto+Internacional+Jos%C3%A9+Joaqu%C3%ADn+de+Olmedo+Guayaquil'

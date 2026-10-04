import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';

export const CHATCONNECT_CONVERSACIONES = [
  {
    id: 1,
    cliente_id: 1,
    nombre: 'Fabián Martínez',
    whatsapp: '+57 310 458 9211',
    avatar: avatar1,
    modo: 'ia',
    ultimo_mensaje: '¡Excelente! Muchas gracias, ya recibí el número de guía para la entrega.',
    hora: '09:18 AM',
    no_leidos: 0,
    mensajes: [
      { id: 1, emisor: 'cliente', texto: 'Hola, buenos días. ¿Tienen bultos de cemento gris Argos disponibles?', hora: '09:05 AM' },
      { id: 2, emisor: 'ia', texto: '¡Hola Fabián! 👋 Sí, tenemos disponible Cemento Gris Uso General 50kg Argos a $34.500 COP la unidad (IVA incluido). Disponemos de más de 300 bultos en bodega. ¿Cuántos deseas solicitar?', hora: '09:06 AM' },
      { id: 3, emisor: 'cliente', texto: 'Necesito 2 bultos de cemento y 1 varilla de 1/2 pulgada de 6 metros.', hora: '09:08 AM' },
      { id: 4, emisor: 'ia', texto: 'Perfecto. Tu pedido incluye:\n• 2x Cemento Gris 50kg: $69.000\n• 1x Varilla 1/2" x 6m: $38.000\nTotal orden: $107.000 COP.\n¿Deseas entrega en tu dirección registrada en Cedritos?', hora: '09:10 AM' },
      { id: 5, emisor: 'cliente', texto: 'Sí por favor, a la misma dirección.', hora: '09:12 AM' },
      { id: 6, emisor: 'ia', texto: '¡Orden formalizada con éxito! 🎉 Número de orden: PED-000101. Nuestro transportador se encuentra cargando el pedido.', hora: '09:15 AM' },
      { id: 7, emisor: 'cliente', texto: '¡Excelente! Muchas gracias, ya recibí el número de guía para la entrega.', hora: '09:18 AM' },
    ],
  },
  {
    id: 2,
    cliente_id: 2,
    nombre: 'Constructora Bolívar - Ing. Ramírez',
    whatsapp: '+57 320 891 4302',
    avatar: avatar2,
    modo: 'humano',
    asesor_asignado: 'Carlos Gómez',
    ultimo_mensaje: 'Ingeniero Ramírez, le acabo de enviar la cotización con el descuento especial por los 50 bultos.',
    hora: '08:45 AM',
    no_leidos: 2,
    mensajes: [
      { id: 1, emisor: 'cliente', texto: 'Buenos días. Necesito cotización urgente para 50 bultos de cemento y 30 varillas de 3/8 con entrega hoy mismo en la obra de Fontibón. Deseo hablar con un asesor comercial.', hora: '08:35 AM' },
      { id: 2, emisor: 'ia', texto: 'Con gusto Ingeniero Ramírez. Estoy transfiriendo esta conversación inmediatamente a nuestro asesor de cuentas corporativas, Carlos Gómez.', hora: '08:36 AM' },
      { id: 3, emisor: 'asesor', texto: 'Buenos días Ingeniero Ramírez, habla Carlos Gómez. Permítame 5 minutos y le estructuro la cotización formal con el flete consolidado a Fontibón.', hora: '08:40 AM' },
      { id: 4, emisor: 'asesor', texto: 'Ingeniero Ramírez, le acabo de enviar la cotización con el descuento especial por los 50 bultos.', hora: '08:45 AM' },
    ],
  },
  {
    id: 3,
    cliente_id: 3,
    nombre: 'Maestro Pedro Nel Osorio',
    whatsapp: '+57 301 774 2019',
    avatar: avatar3,
    modo: 'ia',
    ultimo_mensaje: 'Listo maestro Pedro Nel, su pedido PED-000103 está listo para retirar en la sede principal.',
    hora: '10:25 AM',
    no_leidos: 0,
    mensajes: [
      { id: 1, emisor: 'cliente', texto: 'Buenas, ¿a cómo tienen el taladro DeWalt percutor?', hora: '10:10 AM' },
      { id: 2, emisor: 'ia', texto: '¡Hola Maestro Pedro Nel! El Taladro Percutor 1/2" 650W DeWalt tiene un valor de $285.000 COP con 3 años de garantía oficial.', hora: '10:11 AM' },
      { id: 3, emisor: 'cliente', texto: 'Apárteme uno y también 2 tubos de 3 pulgadas de PVC con 4 codos y soldadura. Paso a recogerlo en un rato.', hora: '10:15 AM' },
      { id: 4, emisor: 'ia', texto: 'Listo maestro Pedro Nel, su pedido PED-000103 está listo para retirar en la sede principal.', hora: '10:25 AM' },
    ],
  },
  {
    id: 4,
    cliente_id: 4,
    nombre: 'Andrea Suescún',
    whatsapp: '+57 315 620 9944',
    avatar: avatar4,
    modo: 'ia',
    ultimo_mensaje: 'El pedido PED-000104 fue confirmado. Pago contraentrega.',
    hora: 'Ayer',
    no_leidos: 0,
    mensajes: [
      { id: 1, emisor: 'cliente', texto: 'Hola, ¿tienen pintura esmalte sintético negro para exteriores?', hora: '05:10 PM' },
      { id: 2, emisor: 'ia', texto: '¡Hola Andrea! Sí, tenemos Esmalte Sintético Anticorrosivo Negro Galón a $68.000 COP.', hora: '05:11 PM' },
      { id: 3, emisor: 'cliente', texto: 'Quiero un galón y un rodillo antigoteo.', hora: '05:15 PM' },
      { id: 4, emisor: 'ia', texto: 'El pedido PED-000104 fue confirmado. Pago contraentrega.', hora: '05:20 PM' },
    ],
  },
];

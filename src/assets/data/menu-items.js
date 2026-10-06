export const MENU_ITEMS = [
  {
    key: 'menu-principal',
    label: 'MENÚ PRINCIPAL',
    isTitle: true,
  },
  {
    key: 'dashboard',
    icon: 'iconamoon:home-duotone',
    label: 'Inicio',
    url: '/dashboard',
  },
  {
    key: 'clientes',
    icon: 'iconamoon:profile-duotone',
    label: 'Clientes',
    url: '/clientes',
  },
  {
    key: 'productos',
    icon: 'iconamoon:shopping-bag-duotone',
    label: 'Productos',
    url: '/catalogo',
  },
  {
    key: 'inventario',
    icon: 'iconamoon:box-duotone',
    label: 'Inventario',
    url: '/inventario',
  },
  {
    key: 'pedidos',
    icon: 'iconamoon:invoice-duotone',
    label: 'Pedidos',
    url: '/pedidos',
  },
  {
    key: 'chat',
    icon: 'iconamoon:comment-dots-duotone',
    label: 'Chat',
    url: '/chat',
  },
  {
    key: 'configuracion',
    icon: 'iconamoon:settings-duotone',
    label: 'Configuración',
    children: [
      {
        key: 'config-inventario',
        label: 'Inventario',
        parentKey: 'configuracion',
        url: '/configuracion/inventario',
      },
      {
        key: 'config-precios',
        label: 'Precios e Impuestos',
        parentKey: 'configuracion',
        url: '/configuracion/precios',
      },
      {
        key: 'config-geo',
        label: 'Ciudades',
        parentKey: 'configuracion',
        url: '/configuracion/geo',
      },
      {
        key: 'config-limpieza',
        label: 'Limpieza de Datos',
        parentKey: 'configuracion',
        url: '/configuracion/limpieza',
      },
    ],
  },
];
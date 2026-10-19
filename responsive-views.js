/**
 * @schema 2.11
 * @input screen: string = "chat"
 * @input header: string = "gtVoG"
 * @input body: string = "PwXUN"
 * @input desktopStyles: string = "{}"
 */
const w = pencil.width, h = pencil.height;
const mode = pencil.input.screen;
const desktop = w >= 1024;
const tablet = w >= 700;
const p = tablet ? 20 : 0;
const sideW = desktop ? (w>=1280?300:260) : 0;
const desktopStyles = desktop ? JSON.parse(pencil.input.desktopStyles || '{}') : {};
const gap = desktop ? 20 : 0;
const mainW = w - p * 2 - sideW - gap;
const innerW = Math.min(mainW, desktop ? 1240 : 760);
const text = (name,content,size=12,color='#222C43',weight='500') => ({type:'text',name,content,fontFamily:'Inter',fontSize:desktop?size+(size>=26?4:size>=12?3:2):size,fontWeight:weight,fill:color,textGrowth:'fixed-width',width:'fill_container',lineHeight:1.3});
const icon = (name,glyph,color='#3478F6',size=20) => ({type:'icon',name,library:'lucide',icon:glyph,width:size,height:size,fill:color});
const f = (name,children,props={}) => ({type:'frame',name,layout:'vertical',width:'fill_container',gap:18,children,...props});
const ref = (id,name,props={}) => {
 const descendants = {...(desktopStyles[id]||{})};
 for (const [key,value] of Object.entries(props.descendants||{})) descendants[key] = {...(descendants[key]||{}),...value};
 return {type:'ref',ref:id,name,enabled:true,width:'fill_container',height:'fit_content',...props,descendants};
};
const row = (name,children,props={}) => f(name,children,{layout:'horizontal',gap:24,...props});
const navMode = mode==='categories'?'Categorías':['catalog','product','checkout'].includes(mode)?'Catálogo':mode==='tracking'?'Mis pedidos':'Conversación';
const sidebar = f('Navegación web · escritorio',[
 f('Identidad y navegación',[
  row('Marca de la aplicación',[ref('C4PSd','Logo ChatConnect · escritorio',{width:42,height:42}),f('Nombre de la aplicación',[text('ChatConnect marca','ChatConnect',19,'#222C43','750'),text('Estado de la tienda','Tu tienda siempre conectada',10,'#626D89')],{gap:3})],{gap:10,alignItems:'center'}),
  f('Menú principal',[text('Etiqueta navegación','MI TIENDA',10,'#626D89','650'),...[['Conversación','messages-square'],['Catálogo','grid-2x2'],['Categorías','layers'],['Mis pedidos','package']].map(([label,glyph])=>row('Ir a '+label,[icon('Icono '+label,glyph),text('Etiqueta '+label,label,13,label===navMode?'#3478F6':'#626D89',label===navMode?'650':'500')],{height:52,padding:[0,12],gap:12,alignItems:'center',fill:label===navMode?'#EEF0FC':'#FFFFFF',cornerRadius:10}))],{gap:8}),
  f('Continuar conversación',[text('Conversación activa etiqueta','CONVERSACIÓN ACTIVA',10,'#626D89','650'),row('Asistente de compras',[icon('Asistente icono','sparkles'),f('Asistente identidad',[text('Asistente nombre','Asistente ChatConnect',12,'#222C43','650'),text('Asistente disponibilidad','En línea · te ayuda a elegir',10,'#626D89')],{gap:4})],{padding:12,gap:10,fill:'#F6F7FB',cornerRadius:10})],{gap:12})
 ],{gap:28}),
 f('Tu bolsa siempre visible',[
  text('Bolsa etiqueta','EN TU BOLSA',10,'#626D89','650'),
  row('Producto de la bolsa',[{type:'rectangle',name:'Taza Arena · vista de escritorio',width:60,height:70,cornerRadius:8,fill:{type:'image',url:'../whatchatDesingweb-assets/generated.png',mode:'cover'}},f('Producto resumido',[text('Nombre en bolsa','Taza Arena',13,'#222C43','650'),text('Variante en bolsa','350 ml · Arena',10,'#626D89'),text('Precio en bolsa','$45.000',15,'#3478F6','650')],{gap:5})],{gap:10,alignItems:'center'}),
  f('Abrir bolsa',[{type:'text',name:'Abrir bolsa etiqueta',content:'Revisar mi bolsa',fontFamily:'Inter',fontSize:12,fontWeight:'650',fill:'#FFFFFF'}],{height:40,fill:'#3478F6',cornerRadius:8,alignItems:'center',justifyContent:'center'})
 ],{fill:'#F6F7FB',cornerRadius:12,padding:14,gap:14})
],{width:sideW,height:'fill_container',padding:20,fill:'#FFFFFF',cornerRadius:16,justifyContent:'space_between'});
let bodyWidth = innerW;
const overrides = {};
const clampBubble = (ids,max,ratio=1) => ids.forEach(id=>overrides[id]={width:Math.min((bodyWidth-36)*ratio,max)});
if (['chat','recommendations','added','chatCatalog'].includes(mode)) {
 bodyWidth = Math.min(mainW, desktop?1120:760);
 const incoming = {chat:['VwtIh','xtPnp','AzMeX'],recommendations:['vgmRJ','FlRTG','LErEY','cnKw4'],added:['CyUcF','vYe2D','okYFZ','VH4WO'],chatCatalog:['Ce0GI','ADmlj','ZozHq']};
 const outgoing = {chat:['v2Tti','cWU4f','gsLz6'],recommendations:[],added:[],chatCatalog:['ahyJN']};
 clampBubble(incoming[mode],desktop?600:480,tablet?1:0.84);
 clampBubble(outgoing[mode],desktop?520:380,tablet?1:0.78);
 if (!tablet) {
  const cards = {chat:['AzMeX'],recommendations:['FlRTG','LErEY'],added:['vYe2D'],chatCatalog:['ADmlj']};
  for (const id of incoming[mode]) overrides[id].cornerRadius = [3,12,12,12];
  for (const id of outgoing[mode]) overrides[id].cornerRadius = [12,3,12,12];
  for (const id of cards[mode]) overrides[id] = {width:Math.min((bodyWidth-36)*0.92,340),cornerRadius:12,fill:'#FFFFFF'};
  const histories = {chat:'XlUyb',recommendations:'UFPYU',added:'Pw4qK',chatCatalog:'vkKfj'};
  overrides[histories[mode]] = {gap:bodyWidth<360?8:12};
  const notes = {chat:[],recommendations:['cnKw4'],added:['okYFZ','VH4WO'],chatCatalog:['ZozHq']};
  for (const id of notes[mode]) overrides[id] = {width:'fill_container'};
 }
}
if (['attach','actions','delete','reaction'].includes(mode)) {
 bodyWidth = Math.min(mainW,mode==='actions'?720:mode==='attach'?580:520);
 const preview = {attach:['HMkel'],actions:['TNNtT'],delete:['M4QW4D'],reaction:['x6GXW']};
 clampBubble(preview[mode],420,tablet?1:0.78);
 if (!tablet) {
  if (mode==='actions') overrides.UviGv = {alignItems:'end'};
  if (mode==='reaction') overrides.dpifR = {alignItems:'end'};
  for (const id of preview[mode]) overrides[id].cornerRadius = mode==='attach'?[3,12,12,12]:[12,3,12,12];
 }
}
if (desktop && mode==='reaction') {
 bodyWidth = Math.min(mainW,980);
 overrides.dpifR = {width:mainW>=900?280:200};
 overrides.x6GXW = {width:'fill_container'};
}
let content = ref(pencil.input.body,'Contenido adaptable · '+mode,{width:bodyWidth,height:'fill_container',...(desktop?{padding:[20,24]}:{}),...(desktop&&mode==='reaction'?{layout:'horizontal',alignItems:'start'}:{}),descendants:overrides});
if (desktop) {
 const area = (name,children,width=innerW) => f(name,children,{width,height:'fill_container',padding:28,gap:24});
 if (mode==='catalog') {
  content = area('Catálogo de escritorio en dos columnas',[
   row('Título y búsqueda',[ref('Tx3g8','Presentación del catálogo'),ref('x3Y2fW','Buscar productos en escritorio',{width:320})],{alignItems:'center'}),
   row('Categorías y productos',[
    ref('aXjk1','Filtros de categoría',{width:240,fill:'#FFFFFF',padding:18,cornerRadius:12,descendants:{ZOizZ:{layout:'vertical',gap:8,padding:0},Z5zsY:{layout:'vertical',alignItems:'start'},Hwr3X:{width:'fill_container'},N7xxj:{width:'fill_container'},FPPxz:{width:'fill_container'},o5wAR2:{width:'fill_container'}}}),
    f('Resultados de la colección',[ref('r7rEF','Encabezado de resultados'),ref('W6wnYN','Tarjetas compactas en dos columnas',{layout:mainW>=1000?'horizontal':'vertical',gap:16}),ref('ME91B','Explorar más resultados'),ref('uhbSw','Ayuda para elegir')],{gap:20})
   ],{alignItems:'start'})
  ]);
 }
 if (mode==='checkout') {
  content = area('Confirmación de compra · escritorio',[
   text('Título confirmar compra','Revisa tu compra',30,'#222C43','700'),ref('dHHoD','Progreso de compra'),
   row('Datos y resumen de pago',[
    f('Entrega y pago',[ref('DFUe9','Producto elegido'),ref('Qohwu','Dirección de entrega'),ref('hD7Ah','Métodos de pago')],{padding:mainW>=900?24:18,fill:'#FFFFFF',cornerRadius:14,gap:26}),
    f('Resumen y confirmación',[ref('HamFF','Costos del pedido',{descendants:mainW<900?{w8Ucy:{layout:'vertical',alignItems:'start',gap:8}}:{}}),ref('xbEid','Confirmar pago'),ref('l66nH3','Seguridad de la compra')],{width:mainW>=900?320:260,gap:18})
   ],{alignItems:'start'})
  ],Math.min(innerW,1120));
 }
 if (mode==='tracking') {
  content = area('Seguimiento de escritorio',[
   text('Título seguimiento','Tu pedido, en ruta',30,'#222C43','700'),ref('zDtaM','Filtros de pedidos'),
   row('Entrega y estado',[
    f('Entrega estimada y producto',[ref('rjrS3','Llegada estimada'),ref('ov16W','Producto del pedido'),ref('C4ibIq','Ayuda sobre este pedido')],{gap:22}),
    ref('QK8yi','Estado del pedido',{padding:24,descendants:{flIit:{layout:'vertical',gap:12},FNjQ6:{layout:'horizontal',gap:14},C04TT:{layout:'horizontal',gap:14},DYn9s:{layout:'horizontal',gap:14},m341d:{layout:'horizontal',gap:14},ZRTRA:{fontSize:13},EKWGG:{fontSize:13},h5PCE:{fontSize:13},AzEdv:{fontSize:13}}})
   ],{alignItems:'start'})
  ],Math.min(innerW,1100));
 }
 if (mode==='product') {
  content = area('Ficha del producto · escritorio',[
   row('Imagen y configuración',[
    f('Imagen y descripción',[ref('Fmzl6','Producto destacado',{layout:'vertical',gap:20,descendants:{VA99o:{width:'fill_container',height:320},C1Q0r:{width:'fill_container'},glcku:{layout:mainW>=1000?'horizontal':'vertical',justifyContent:'space_between',alignItems:mainW>=1000?'center':'start'},TI7fQ:{content:'Taza Arena',fontSize:32}}}),ref('WLuld','Descripción del producto')],{gap:24}),
    f('Personalizar y añadir',[ref('HkzOL','Opciones del producto',{padding:24,gap:24}),ref('iwGVd','Disponibilidad del producto'),ref('KUKh8','Añadir selección a la bolsa')],{width:380,gap:24})
   ],{alignItems:'start'})
  ],Math.min(innerW,1120));
 }
 if (mode==='location') {
  content = area('Selección de entrega · escritorio',[
   ref('JjLed','Título de ubicación'),
   row('Dirección y lugares',[
    f('Tu ubicación actual',[ref('CAUBX','Dirección detectada'),ref('v5oJpK','Buscar otra dirección'),ref('rRj0X','Privacidad de tu ubicación')],{gap:22}),
    f('Compartir y elegir lugar',[ref('WZ0LX','Formas de compartir'),text('Lugares cercanos etiqueta','ELIGE UN LUGAR CERCANO',10,'#626D89','650'),ref('ca5rb','Centro Comercial Avenida Chile'),ref('JKxrJ','Parque de los Hippies')],{gap:20})
   ],{alignItems:'start'})
  ],Math.min(innerW,1040));
 }
 if (mode==='categories') {
  content = ref(pencil.input.body,'Categorías y subcategorías · escritorio',{width:Math.min(innerW,1040),height:'fill_container',padding:28,gap:24,descendants:{cfxyo:{height:Math.max(320,Math.min(520,h-540)),gap:24},K2oh8:{width:240,gap:14},a3oD9:{layout:'horizontal',padding:12,gap:12,alignItems:'center'},JklTO:{layout:'horizontal',padding:14,gap:12,alignItems:'center'},rGmnp:{layout:'horizontal',padding:12,gap:12,alignItems:'center'},h1QBo:{layout:'horizontal',padding:12,gap:12,alignItems:'center'},f9XwV:{layout:'horizontal',padding:12,gap:12,alignItems:'center'},gLbPu:{padding:24,gap:20},qtL0l:{gap:16},NcNwg:{padding:20},J1zP9N:{padding:20},TtOo2:{padding:20},tT33N:{padding:20}}});
 }
}
const main = f('Área principal · '+mode,[ref(pencil.input.header,'Cabecera de la pantalla',{height:'fit_content',...(desktop?{padding:[18,24]}:{})}),content],{width:mainW,height:'fill_container',gap:0,fill:'#F2F4FA',cornerRadius:desktop?16:0,alignItems:'center',clip:true});
return [row('Aplicación web adaptable · '+mode,[...(desktop?[sidebar]:[]),main],{x:0,y:0,width:w,height:h,padding:p,gap,clip:true})];

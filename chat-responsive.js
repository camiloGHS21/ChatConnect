/** @schema 2.11 */
const w = pencil.width;
const h = pencil.height;
const desktop = w >= 1024;
const outer = w;
const pad = w >= 700 ? 20 : 0;
const available = outer - pad * 2;
const side = desktop ? 288 : 0;
const gap = desktop ? 20 : 0;
const chatW = available - side - gap;
const contentW = Math.min(chatW, desktop ? 1120 : 760);
const text = (name, content, size, color, weight = '500') => ({type:'text',name,content,fontFamily:'Inter',fontSize:size,fontWeight:weight,fill:color,textGrowth:'fixed-width',width:'fill_container'});
const icon = (name, glyph, color = '#3478F6') => ({type:'icon',name,library:'lucide',icon:glyph,width:20,height:20,fill:color});
const sidebar = {
 type:'frame',name:'Panel de compra · escritorio',width:side,height:'fill_container',layout:'vertical',padding:20,gap:22,fill:'#FFFFFF',cornerRadius:16,
 children:[
  {type:'frame',name:'Identidad de la experiencia web',width:'fill_container',gap:10,alignItems:'center',children:[{type:'ref',ref:'C4PSd',name:'Logo ChatConnect · escritorio',width:42,height:42}, {type:'frame',name:'Marca y propósito',width:'fill_container',layout:'vertical',gap:4,children:[text('Marca ChatConnect','ChatConnect',18,'#222C43','700'),text('Propósito del asistente','Tu tienda, en una conversación',10,'#626D89')]}]},
  {type:'frame',name:'Introducción del panel',width:'fill_container',layout:'vertical',gap:8,children:[text('Título panel de compra','Tu compra,\na tu ritmo.',26,'#222C43','700'),text('Descripción del panel','Explora productos mientras conversas. Tu selección siempre está a mano.',12,'#626D89')]},
  {type:'frame',name:'Selección actual',width:'fill_container',layout:'vertical',padding:14,gap:14,fill:'#F6F7FB',cornerRadius:12,children:[text('Encabezado selección','EN TU BOLSA',10,'#626D89','650'),{type:'frame',name:'Producto seleccionado compacto',width:'fill_container',gap:10,alignItems:'center',children:[{type:'rectangle',name:'Foto Taza Arena · panel',width:64,height:74,cornerRadius:8,fill:{type:'image',url:'../whatchatDesingweb-assets/generated.png',mode:'cover'}},{type:'frame',name:'Detalle de la selección',width:'fill_container',layout:'vertical',gap:6,children:[text('Nombre producto panel','Taza Arena',13,'#222C43','650'),text('Variante producto panel','350 ml · Arena',10,'#626D89'),text('Precio producto panel','$45.000',15,'#3478F6','650')]}]}, {type:'frame',name:'Resumen subtotal',width:'fill_container',gap:10,justifyContent:'space_between',children:[text('Etiqueta subtotal panel','Subtotal',11,'#626D89'),text('Monto subtotal panel','$45.000',12,'#222C43','650')]}, {type:'frame',name:'Abrir bolsa desde escritorio',width:'fill_container',height:40,fill:'#3478F6',cornerRadius:8,alignItems:'center',justifyContent:'center',children:[{type:'text',name:'Abrir bolsa etiqueta',content:'Revisar mi bolsa',fontFamily:'Inter',fontSize:12,fontWeight:'650',fill:'#FFFFFF'}]}]},
  {type:'frame',name:'Accesos a la tienda',width:'fill_container',layout:'vertical',gap:12,children:[text('Título accesos','SIGUE EXPLORANDO',10,'#626D89','650'), ...[['Catálogo','grid-2x2'],['Categorías','layers'],['Mis pedidos','package']].map(([label,glyph]) => ({type:'frame',name:'Acceso '+label,width:'fill_container',height:42,gap:10,alignItems:'center',children:[icon('Icono '+label,glyph),text('Etiqueta '+label,label,12,'#222C43','600'),{type:'icon',name:'Flecha '+label,library:'lucide',icon:'chevron-right',width:14,height:14,fill:'#626D89'}]}))]},
  {type:'frame',name:'Ayuda de compra',width:'fill_container',layout:'vertical',padding:14,gap:8,fill:'#EEEAF9',cornerRadius:10,children:[icon('Icono de ayuda','sparkles','#7361B9'),text('Título de ayuda','¿Necesitas una recomendación?',12,'#423769','650'),text('Descripción de ayuda','Pregúntale al asistente. Te ayuda a elegir y a completar tu pedido.',11,'#70658A')]}
 ]
};
const sidebarFooter = sidebar.children.pop();
sidebar.children = [{type:'frame',name:'Contenido del panel de compra',width:'fill_container',layout:'vertical',gap:22,children:sidebar.children},sidebarFooter];
sidebar.justifyContent = 'space_between';
return [{type:'frame',name:'Chat adaptable · vista única',x:0,y:0,width:outer,height:h,layout:'horizontal',padding:pad,gap,children:[...(desktop?[sidebar]:[]),{type:'frame',name:'Conversación a ancho completo',width:chatW,height:'fill_container',layout:'vertical',alignItems:'center',fill:'#F2F4FA',cornerRadius:desktop?16:0,clip:true,children:[{type:'ref',ref:'gtVoG',name:'Cabecera adaptable del chat',enabled:true,width:'fill_container',height:'fit_content'},{type:'ref',ref:'PwXUN',name:'Contenido adaptable del chat',enabled:true,width:contentW,height:'fill_container',descendants:{VwtIh:{width:Math.min(contentW-36,480)},v2Tti:{width:Math.min(contentW-36,380)},cWU4f:{width:Math.min(contentW-36,380)},gsLz6:{width:Math.min(contentW-36,380)},xtPnp:{width:Math.min(contentW-36,480)},AzMeX:{width:Math.min(contentW-36,480)}}}]}]}];

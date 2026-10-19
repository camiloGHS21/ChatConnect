import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { LoginModule } from './login/login.module.js';
import { ProductoModule } from './producto/producto.module.js';
import { PedidoModule } from './pedido/pedido.module.js';
import { ClienteModule } from './cliente/cliente.module.js';
import { InventarioModule } from './inventario/inventario.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { EmpresaModule } from './empresa/empresa.module.js';
import { ConsecutivoModule } from './consecutivo/consecutivo.module.js';

@Module({
  imports: [
    DatabaseModule,
    LoginModule,
    ProductoModule,
    PedidoModule,
    ClienteModule,
    InventarioModule,
    DashboardModule,
    EmpresaModule,
    ConsecutivoModule,
  ],
})
export class AppModule {}

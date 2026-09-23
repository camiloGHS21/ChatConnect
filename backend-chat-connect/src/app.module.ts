import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { LoginModule } from './login/login.module.js';
import { ProductoModule } from './producto/producto.module.js';

@Module({
  imports: [
    DatabaseModule,
    LoginModule,
    ProductoModule,
  ],
})
export class AppModule {}

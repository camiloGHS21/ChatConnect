import { PartialType } from '@nestjs/mapped-types';
import { CreateLoginDto } from './create-login.dto.js';

/**
 * Objeto de Transferencia de Datos (DTO) para la actualización parcial de credenciales.
 */
export class UpdateLoginDto extends PartialType(CreateLoginDto) {}


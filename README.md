# angular-prueba-fondos

Aplicacion Angular para gestion de fondos, suscripciones/cancelaciones e historial de transacciones, con enfoque en arquitectura limpia.

## 1. Stack tecnico

- Angular 21 (standalone components)
- TypeScript
- RxJS
- json-server (mock backend)
- Jest + jest-preset-angular (unit testing y cobertura)

## 2. Requisitos

- Node.js 20+
- npm 10+

## 3. Instalacion

```bash
npm install
```

## 4. Ejecucion del proyecto

### Opcion recomendada (frontend + mock API)

Levanta Angular y json-server al mismo tiempo:

```bash
npm run start:dev
```

Servicios:

- Frontend: http://localhost:4200
- API mock: http://localhost:3000

### Solo frontend

```bash
npm start
```

### Solo mock API

```bash
npm run json-server
```

## 5. Scripts principales

- `npm start`: inicia Angular en modo desarrollo
- `npm run start:dev`: inicia Angular + json-server en paralelo
- `npm run build`: build de produccion
- `npm run watch`: build continuo en modo desarrollo
- `npm test`: corre pruebas unitarias con Jest y genera cobertura
- `npm run test:watch`: modo watch de Jest
- `npm run test:ng`: runner de pruebas de Angular CLI

## 6. Pruebas unitarias y cobertura

Este proyecto usa Jest como runner principal.

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar en modo watch

```bash
npm run test:watch
```

### Reportes de cobertura

Al ejecutar `npm test` se generan reportes en:

- `coverage/jest/`
- `coverage/jest/lcov-report/index.html` (reporte HTML)

Estado actual esperado: cobertura global muy alta (incluyendo casos de negocio, infraestructura, componentes y branches).

## 7. Arquitectura

Se aplica arquitectura limpia por capas:

- `presentation`: componentes/paginas UI y manejo de estado de pantalla
- `application`: casos de uso (orquestacion de reglas)
- `dominio`: entidades y puertos (interfaces de repositorio)
- `infrastructure`: adaptadores concretos (API, DTOs, mappers)
- `core`: servicios tecnicos transversales (ApiService, tokens DI, interceptores)

Direccion de dependencias:

- `presentation -> application -> dominio`
- `infrastructure -> dominio` (implementa puertos)
- `core` aporta piezas tecnicas de soporte

## 8. Estructura del proyecto (resumen)

```text
src/app/
	application/
		use-cases/
	core/
		interceptors/
		services/
		tokens/
	dominio/
		entities/
		repositories/
	infrastructure/
		funds/
		portfolio/
	presentation/
		features/
```

## 9. Integracion de datos

La API mock se basa en `db.json` y expone recursos como:

- `/fondos`
- `/users`
- `/subscriptions`
- `/transactions`

La URL base se inyecta desde `environment.apiBaseUrl`.

## 10. Configuracion de entornos

- Desarrollo: `http://localhost:3000`
- Produccion: `https://api.example.com` (placeholder, reemplazar por URL real)

Archivos relacionados:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

## 11. Flujo funcional principal

1. Consultar fondos disponibles.
2. Ver balance del usuario.
3. Suscribirse a un fondo con validaciones (monto minimo, duplicado, saldo).
4. Cancelar suscripcion activa y reembolsar saldo.
5. Registrar y consultar historial de transacciones.

## 12. Buenas practicas del repositorio

- Mantener reglas de negocio en casos de uso, no en componentes.
- Mantener contratos (interfaces) en dominio.
- Usar mappers para convertir DTOs a entidades.
- Mantener pruebas unitarias por capa (use-case, service, mapper, component).
- Antes de push: ejecutar `npm test` y `npm run build`.

## 13. Troubleshooting rapido

- Si falla la API: verificar que json-server este en puerto 3000.
- Si falla DI en runtime: validar providers y tokens en la configuracion global.
- Si cambias endpoints/DTOs: actualizar mapper y pruebas asociadas.
- Si cambia comportamiento de UI: ajustar tests de componentes en `presentation/features`.

## 14. Comandos recomendados antes de merge

```bash
npm run build
npm test
```

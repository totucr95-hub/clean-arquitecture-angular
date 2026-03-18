# Clean Architecture guide (Angular)

## Main rule

Dependencies always point inward:

- presentation -> application -> dominio
- infraestructure -> application + dominio
- core is transversal and must not contain business rules

## Folder responsibilities

- core/services: technical cross-cutting services (logger, storage, app-config, session)
- core/tokens: DI tokens and provider contracts shared by app
- application/use-cases: business use cases orchestrating entities/repositories
- dominio/entities: domain entities and invariants
- dominio/repositories: repository interfaces (ports)
- infraestructure/repositories: adapter implementations (http/db/api)
- presentation/features: pages/components by feature
- presentation/shared/components: reusable UI components

## Suggested file naming

Use feature-first naming to keep search simple:

- fund.entity.ts, transaction.entity.ts, user.entity.ts
- fund.repository.ts (interface in dominio/repositories)
- fund-http.repository.ts (implementation in infraestructure/repositories/funds)
- subscribe-fund.use-case.ts (in application/use-cases/funds)
- fund-list.page.ts or fund-list.component.ts (in presentation/features/funds)

## Migration path (safe)

1. Keep current files where they are.
2. For every new code file, use the new folders.
3. Move old files gradually when related imports are touched.
4. Add tests per use-case and repository adapter as you migrate.

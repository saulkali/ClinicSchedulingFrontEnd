# Contributing Guide

Guía práctica para desarrolladores que colaboren en **Clinic Scheduling Frontend**.

## 1) Objetivo

Mantener un código consistente, fácil de mantener y alineado al patrón MVVM utilizado por el proyecto.

## 2) Principios técnicos

- **Separación de responsabilidades:**
  - `views` para render/UI.
  - `viewmodels` para estado y reglas de presentación.
  - `repositories` para acceso a datos externos.
- **Tipado explícito:** priorizar tipos/entidades compartidas en `src/common/entities`.
- **Escalabilidad:** preferir módulos pequeños y componentes reutilizables.
- **Legibilidad:** código claro > soluciones “ingeniosas” difíciles de mantener.

## 3) Convenciones de estructura

### Nuevas pantallas

Al agregar una nueva pantalla, crear (cuando aplique):

1. `src/views/<Feature>View.tsx`
2. `src/viewmodels/<Feature>ViewModel.ts`
3. Interface de repositorio en `src/models/irepositories/`
4. Implementación HTTP en `src/models/repositories/`
5. Entidades en `src/common/entities/` (si son nuevas en dominio)

### Componentes reutilizables

- Colocar en `src/views/components/` si son compartidos entre vistas.
- Evitar componentes extremadamente acoplados a una sola pantalla, salvo necesidad clara.

## 4) Estándares de código

- Mantener componentes y funciones con una sola responsabilidad principal.
- Evitar lógica de negocio en JSX.
- Centralizar llamadas HTTP en repositories.
- Evitar duplicidad de mapeos DTO ↔ entidades.
- Nombrar archivos y símbolos de forma descriptiva y consistente.

## 5) Manejo de configuración y entornos

- Preferir variables `VITE_*` para configuración sensible al entorno.
- No hardcodear URLs de API en vistas o viewmodels.
- Canalizar configuración mediante `src/common/config/env.ts`.

## 6) Checklist antes de enviar cambios

1. `npm run lint`
2. `npm run build`
3. Validación manual de flujos impactados
4. Actualización de documentación (`README.md` / guías) si cambia comportamiento

## 7) Estrategia de ramas y commits

- Ramas sugeridas:
  - `feature/<nombre-corto>`
  - `fix/<nombre-corto>`
  - `chore/<nombre-corto>`
- Commits recomendados (estilo semántico opcional):
  - `docs: ...`
  - `feat: ...`
  - `fix: ...`
  - `refactor: ...`

## 8) Pull Requests

Todo PR debería incluir:

- Contexto del problema.
- Solución implementada.
- Impacto funcional.
- Evidencia de validación (build/lint/manual).
- Riesgos o puntos de seguimiento.

## 9) Documentación viva

Cuando se agregue o cambie una funcionalidad relevante:

- Actualizar `README.md` (visión general y arranque).
- Actualizar/crear documentos de apoyo para onboarding técnico.
- Evitar que la documentación quede desfasada respecto al código.

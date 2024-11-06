# ADR 016: Adoption of Radix UI and shadcn/ui

**Status:** Approved

## Context
After using custom UI components and later the Catalyst framework, we identified the need for a more robust and accessible component system that would provide better primitives while maintaining flexibility in styling and behavior.

## Decision
We have decided to adopt **Radix UI** as our base component library and **shadcn/ui** as our component system, integrated with Tailwind CSS for styling.

## Alternatives Considered
- Continuing with purely custom components (too much maintenance)
- Using Material UI or Ant Design (less flexible for our design needs)
- Using only Radix UI without shadcn/ui (would require more custom implementation)

## Consequences
### Positive:
- **Accessibility**: Radix UI provides robust accessibility features out of the box
- **Flexibility**: shadcn/ui components can be easily customized and copied into our codebase
- **Developer Experience**: Strong TypeScript support and consistent API
- **Design System**: Better integration with our Tailwind-based design system
- **Performance**: Components are lightweight and tree-shakeable

### Negative:
- **Learning Curve**: Team needs to learn Radix UI patterns and shadcn/ui conventions
- **Migration Effort**: Existing components need to be migrated
- **Styling Complexity**: Need to manage both Tailwind and CSS-in-JS in some cases

## Implementation
- Radix UI primitives are used for complex interactive components
- shadcn/ui provides the base component system
- Components are customized through a central `components.json` configuration
- Tailwind CSS is used for styling and theme customization
- Framer Motion is integrated for advanced animations when needed 
import type { ThreeElements } from '@react-three/fiber';

// React 19 resolves JSX intrinsic elements via the `react` module's JSX
// namespace (React.JSX), not the legacy global JSX namespace that
// @react-three/fiber v8 augments. We add R3F's three.js primitives
// (mesh, group, geometries, materials, lights…) to React.JSX so they
// type-check correctly under React 19.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

/** Plain CSS side-effect imports (e.g. `import './styles.css'`). Listed after *.module.css. */
declare module '*.css';

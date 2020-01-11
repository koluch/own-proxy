declare module "*.postcss" {
  const exports: { [exportName: string]: string };
  export default exports;
}

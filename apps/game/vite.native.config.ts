import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: './',
  define: {'process.env.NODE_ENV': JSON.stringify('production')},
  plugins: [react(), {name: 'native-html', generateBundle() {
    this.emitFile({type:'asset',fileName:'native.html',source:'<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="theme-color" content="#07101b"><title>Molecule Foundry</title><link rel="stylesheet" href="./game.css"></head><body><div id="root"></div><script src="./game.js"></script></body></html>'});
  }}],
  build: { outDir: 'dist/native', emptyOutDir: true, lib: {entry:'src/native.tsx',name:'MoleculeFoundry',formats:['iife'],fileName:()=> 'game.js',cssFileName:'game'}, rollupOptions: {output:{inlineDynamicImports:true}} },
});

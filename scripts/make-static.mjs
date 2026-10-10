// Gera "site-pronto" para abrir com duplo clique e sincroniza a cópia entregável em ../site.
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs'
execSync('npx vite build -c vite.static.config.js --emptyOutDir', { stdio: 'inherit' })
let html = readFileSync('site-pronto/index.html', 'utf8')
html = html.replace(/ type="module"/g, '').replace(/ crossorigin/g, '').replace(/<script src=/g, '<script defer src=')
html = html.replace('</head>', '<link rel="stylesheet" href="./assets/style.css"/></head>')
mkdirSync('site-pronto/assets', { recursive: true })
let css = readFileSync('src/styles/global.css', 'utf8')
css = css.replaceAll("url('/como-vai-funcionar-fundo.png')", "url('../como-vai-funcionar-fundo.png')")
writeFileSync('site-pronto/assets/style.css', css)
writeFileSync('site-pronto/index.html', html)
cpSync('site-pronto', '../site', { recursive: true, force: true })
console.log('site-pronto e ../site atualizados.')

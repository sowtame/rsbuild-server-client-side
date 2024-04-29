import { renderToString } from 'react-dom/server'
import { AppManifest } from '../../../../rsbuild/plugins/asset-plugin'
import App from '../../../App'
import fs from 'fs'
import { FastifyReply, FastifyRequest } from 'fastify'

const path = `${process.cwd()}/dist/static/app-manifest.json`

export const serverRender = (req: FastifyRequest, res: FastifyReply) => {
  const manifestString = fs.readFileSync(path, 'utf-8')

  const manifest: AppManifest = JSON.parse(manifestString)

  const markup = renderToString(<App />)

  const html = `<!DOCTYPE html>
    <html>
        <head>
        <title>Rsbuild custom server</title>
        ${manifest.css
          .map(({ path }) => {
            return `<link rel="stylesheet" href="${path}"/>`
          })
          .join('')}
        </head>
        <body>
            <div id="root">
                ${markup}
            </div>
            ${manifest.js
              .map(({ path }) => {
                return `<script defer src="${path}"></script>`
              })
              .join('')}
        </body>
    </html>
  `

  return res.header('content-type', 'text/html').send(html)
}

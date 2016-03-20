// Configuration Webpack
// =====================

const Path = require('path')
const parts = require('./webpack.config.parts')
const merge = require('webpack-merge')

const PATHS = {
  app: Path.resolve(__dirname, '../src/client'),
  build: Path.resolve(__dirname, '../public'),
  root: Path.resolve(__dirname, '..'),
}

const CORE_CONFIG = merge([
  {
    entry: {
      main: ['babel-polyfill', Path.resolve(PATHS.app, 'application.js')],
    },
    output: {
      crossOriginLoading: 'anonymous',
      // Format des URLs de fichiers d’origine dans les source maps.
      // On vire le `?query` par défaut, qui est moche et ne sert à rien
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]',
      // Schéma des noms de fichiers bundles. Le `[name]` sera remplacé par
      // le nom du bundle, basé sur celui de l’entrée (ex. `main`). Ce nom
      // peut contenir des chemins au début, le tout relatif à `output.path`.
      filename: '[name].js',
      // Chemin absolu racine de production des fichiers bundlés.
      path: PATHS.build,
      // Préfixe de chemin des URLs pour les fichiers produits.  Ici, on est
      // « racine domaine », mais si on prévoit un déploiement (dev ou prod)
      // dans un sous-chemin, il est impératif de le caler ici.
      publicPath: '/',
    },
  },
  parts.cleanDist([PATHS.build], { root: PATHS.root }),
  parts.friendlyErrors(),
  parts.babelize({ include: PATHS.app }),
  parts.compilePug(),
  parts.lintJS(),
  parts.extractCSS(),
  parts.extractStylus({ include: PATHS.app }),
  parts.loadFonts(),
  parts.loadImages(),
  parts.ignoreMomentLocales(),
  parts.useModuleLevelCache(),
  parts.assetsManifest(),
])

const devConfig = () =>
  merge.smart([
    { mode: 'development' },
    CORE_CONFIG,
    parts.generateSourceMaps(),
  ])

const productionConfig = () =>
  merge.smart([
    { mode: 'production' },
    CORE_CONFIG,
    parts.generateSourceMaps('source-map'),
    parts.optimizeImages(),
  ])

module.exports = (env = process.env.NODE_ENV) =>
  env === 'production' ? productionConfig() : devConfig()

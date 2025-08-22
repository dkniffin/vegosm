const { parseArgs } = require("util")

// Parse command line arguments
const { values: args } = parseArgs({
  options: {
    watch: {
      type: 'boolean',
      default: false
    },
    minify: {
      type: 'boolean',
      default: false
    },
    "public-path": {
      type: 'string',
      default: "/dist"
    }
  },
  allowPositionals: true,
  strict: false // Allow other flags to pass through
})

require("esbuild").context({
  entryPoints: ["src/js/index.js"],
  bundle: true,
  sourcemap: true,
  publicPath: args["public-path"],
  outdir: "dist",
  plugins: [],
  minify: args.minify,
  loader: {
    ".png": "file",
    ".svg": "file"
  }
}).then(context => {
  if (args.watch) {
    // Enable watch mode
    context.watch()
  } else {
    // Build once and exit if not in watch mode
    context.rebuild().then(result => {
      context.dispose()
    })
  }
}).catch(() => process.exit(1))

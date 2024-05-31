// configs/options for npm packages
import notify from 'gulp-notify';
import autoprefixer from 'autoprefixer';
import mediaquery from 'postcss-combine-media-query';
import cssnano from 'cssnano';

export const plumberNotify = title => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error <%= error.message %>',
      sound: false,
    }),
  };
};

export const fileIncludeSettings = {
  prefix: '@@',
  basepath: '@file',
};

export const typografOptions = {
  locale: ['ru', 'en-US'],
  htmlEntity: { type: 'digit' },
  safeTags: [
    ['<\\?php', '\\?>'],
    ['<no-typography>', '</no-typography>'],
  ],
};

export const webpHTMLOptions = {
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  retina: {
    1: '',
    2: '@2x',
  },
};

export const svgStack = {
  mode: {
    stack: {
      example: true,
    },
  },
  shape: {
    transform: [
      {
        svgo: {
          js2svg: { indent: 4, pretty: true },
        },
      },
    ],
  },
};

export const svgSymbol = {
  mode: {
    symbol: {
      sprite: '../sprite.symbol.svg',
    },
  },
  shape: {
    transform: [
      {
        svgo: {
          js2svg: { indent: 4, pretty: true },
          plugins: [
            {
              name: 'removeAttrs',
              params: {
                attrs: '(fill|stroke)',
              },
            },
          ],
        },
      },
    ],
  },
};

export const prettierOptions = {
  tabWidth: 4,
  useTabs: true,
  printWidth: 182,
  trailingComma: 'es5',
  bracketSpacing: false,
};

export const postcssPlugins = [autoprefixer(), mediaquery(), cssnano()];

export const htmlMinifyOptions = {
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortClassName: true,
  useShortDoctype: true,
  collapseWhitespace: true,
  minifyCSS: true,
  keepClosingSlash: true,
};

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../..');
const viewsRoot = path.join(__dirname, '../views');
const publicRoot = path.join(__dirname, '../public');
const angularDist = path.join(workspaceRoot, 'dist/apps/angular-app/browser');
const bannerRemoteDist = path.join(workspaceRoot, 'dist/apps/banner/browser');

const port = Number(process.env.PORT ?? 4200);
const app = express();

app.set('view engine', 'ejs');
app.set('views', viewsRoot);

app.use('/cms-assets', express.static(publicRoot));
app.use('/remotes/banner', express.static(bannerRemoteDist));

function remotesReady() {
  return fs.existsSync(path.join(bannerRemoteDist, 'remoteEntry.json'));
}

function readAngularAssets() {
  const indexPath = path.join(angularDist, 'index.html');
  if (!fs.existsSync(indexPath) || !remotesReady()) {
    return { ready: false, head: '', scripts: '' };
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const head = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]).join('\n');
  const scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)]
    .map((match) => match[0])
    .join('\n');

  return { ready: true, head, scripts };
}

function renderPage(res, view, locals) {
  const assets = readAngularAssets();
  res.render(view, {
    ...locals,
    angularReady: assets.ready,
    angularHead: assets.head,
    angularScripts: assets.scripts,
  });
}

const pages = {
  home: {
    path: '/',
    view: 'pages/home',
    title: 'Home',
    nav: 'home',
    cmsState: {
      locale: 'en',
      page: { id: 'home', title: 'Home', path: '/' },
    },
  },
  campaign: {
    path: '/campaign',
    view: 'pages/campaign',
    title: 'Campaign',
    nav: 'campaign',
    cmsState: {
      locale: 'en',
      page: { id: 'campaign', title: 'Spring Campaign', path: '/campaign' },
    },
  },
  collection: {
    path: '/collection',
    view: 'pages/collection',
    title: 'Collection',
    nav: 'collection',
    cmsState: {
      locale: 'en',
      page: { id: 'collection', title: 'Editorial Collection', path: '/collection' },
    },
  },
  article: {
    path: '/article',
    view: 'pages/article',
    title: 'Article',
    nav: 'article',
    cmsState: {
      locale: 'fr',
      page: { id: 'article', title: 'Field Notes', path: '/article' },
    },
  },
};

for (const page of Object.values(pages)) {
  app.get(page.path, (_req, res) => {
    renderPage(res, page.view, {
      title: page.title,
      nav: page.nav,
      cmsState: page.cmsState,
    });
  });
}

app.use(express.static(angularDist, { index: false }));

app.listen(port, () => {
  console.log(`CMS host listening on http://localhost:${port}`);
});

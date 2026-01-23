# Shopify Vue Theme Development

Professional Shopify theme development skeleton with Vue 3, Vite, and Tailwind CSS v4.

## Structure

```
/
├── src/                    # Modern source code (Vite input)
│   ├── main.js            # Vue initialization and component mounting
│   ├── components/        # Vue SFC components
│   ├── styles/            # Tailwind CSS and global styles
│   └── utils/             # Shopify API helpers
├── shopify/               # Source Shopify theme files (tracked in git)
│   ├── assets/           # Static assets (images, fonts, etc.)
│   ├── config/
│   ├── layout/
│   ├── locales/
│   ├── sections/
│   ├── snippets/
│   └── templates/
├── dist/                  # Built theme (untracked - generated on build)
│   ├── assets/           # Vite builds here: main.js, main.css + static assets
│   └── [all theme files copied from /shopify]
└── [config files]         # Vite, Tailwind, PostCSS configs
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your Shopify store:**
   Update `shopify.theme.toml` with your store URL:
   ```toml
   [environments.development]
   store = "your-store.myshopify.com"
   ```

3. **Integrate Vite assets in theme.liquid:**
   Ensure `/shopify/layout/theme.liquid` loads the built assets:
   ```liquid
   <!-- In <head> -->
   {{ 'main.css' | asset_url | stylesheet_tag }}

   <!-- Before </body> -->
   <script src="{{ 'main.js' | asset_url }}" defer></script>
   ```
   (These files will be in `/dist/assets/` after building)

## Development

**Two terminal workflow:**

1. **Terminal 1 - Start Vite dev server:**
   ```bash
   npm run dev
   ```
   This builds assets to `/shopify/assets/` with HMR.

2. **Terminal 2 - Start Shopify theme server:**
   ```bash
   npm run shopify:dev
   ```
   This serves `/shopify` directory directly.

3. **Access your store:**
   - Open the URL provided by `shopify theme dev`
   - Edit files in `/shopify` (Liquid) or `/src` (Vue/JS/CSS)
   - Vite HMR updates automatically for Vue components and styles
   - Shopify theme dev reloads for Liquid changes

## Production Build

Build for production deployment:
```bash
npm run build
```

This process:
1. Removes old `/dist` folder
2. Copies `/shopify` → `/dist`
3. Compiles `src/main.js` → `dist/assets/main.js`
4. Compiles `src/styles/app.css` → `dist/assets/main.css`

The `/dist` folder contains your complete, optimized, ready-to-deploy theme.

## Deployment

Deploy to Shopify (builds and pushes):
```bash
npm run deploy
```

Or build separately:
```bash
npm run build           # Build production to /dist
shopify theme push --path=dist
```

Pull from Shopify:
```bash
npm run shopify:pull    # Pull theme to /shopify
```

## Tailwind CSS

Standard Tailwind classes without prefix:

```html
<div class="bg-blue-500 text-white p-4">
  Content
</div>
```

If you need to avoid conflicts with existing theme styles, add `prefix: 'tw-'` to `tailwind.config.js`.

## Vue Components

### Creating a component

1. Create a `.vue` file in `src/components/`
2. Register it in `src/main.js`:
   ```js
   import MyComponent from './components/MyComponent.vue';
   const components = {
     'my-component': MyComponent,
   };
   ```

### Using in Liquid

Mount Vue components using `data-vue-mount`:

```liquid
<div
  data-vue-mount="add-to-cart"
  data-props='{"productId": {{ product.id }}, "variantId": {{ variant.id }}}'
>
  <!-- Fallback content if JS disabled -->
</div>
```

Or use the helper snippet:
```liquid
{% render 'vue-mount-snippet',
  component: 'add-to-cart',
  props: product_json
%}
```

### Passing Shopify data to Vue

Serialize Shopify objects to JSON in Liquid, then parse in Vue:

```liquid
{% capture product_data %}
{
  "id": {{ product.id | json }},
  "title": {{ product.title | json }},
  "price": {{ product.price | json }}
}
{% endcapture %}

<div
  data-vue-mount="product-card"
  data-props='{{ product_data }}'
></div>
```

## Shopify Cart API

Use the utilities in `src/utils/shopify-cart.js`:

```js
import { addToCart, getCart, updateCart } from '@utils/shopify-cart';

// Add to cart
await addToCart({ id: variantId, quantity: 1 });

// Get cart
const cart = await getCart();
```

## Scripts

**Development:**
- `npm run dev` - Vite dev server (builds to `/shopify/assets/`)
- `npm run shopify:dev` - Shopify theme dev server (serves `/shopify`)

**Production:**
- `npm run build` - Build production theme to `/dist`
- `npm run deploy` - Build and push `/dist` to Shopify
- `npm run shopify:pull` - Pull theme from Shopify to `/shopify`

## Important Notes

- **Development**: Edit files in `/shopify` and `/src` - assets build to `/shopify/assets/`
- **Production**: Build creates `/dist` with optimized assets - deploy this folder
- **Never edit**: `/dist` folder or built files in `/shopify/assets/` (main.js, main.css)
- **Theme editor**: Vue components work in the Shopify theme editor; they reinitialize on section reload
- **JSON templates**: Fully compatible with Shopify 2.0 JSON templates and sections

## Theme Editor Compatibility

Vue components automatically reinitialize when sections are loaded/reloaded in the Shopify theme editor. The `shopify:section:load` event is handled in `src/main.js`.

## Project Structure Notes

- **`/shopify`**: Source Shopify theme files (tracked in git, except built assets)
- **`/src`**: Vue components, styles, and utilities (tracked in git)
- **`/dist`**: Production build output (untracked - generated by `npm run build`)
- **Dev workflow**: Edit `/shopify` + `/src` → Vite builds to `/shopify/assets/` → Shopify CLI serves `/shopify`
- **Prod workflow**: `npm run build` → copies to `/dist` with optimized assets → deploy `/dist`
- **Static assets**: Place images, fonts, etc. in `/shopify/assets/` (they're preserved during build)

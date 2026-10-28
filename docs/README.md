[Openpayments.dev](https://openpayments.dev) is built with [Starlight](https://starlight.astro.build/getting-started/), a documentation framework built on [Astro](https://astro.build/).

## Contributions

Please read the [contribution](https://github.com/interledger/open-payments/blob/main/.github/contributing.md) guidelines before submitting contributions. All contributions must adhere to our [code of conduct](https://github.com/interledger/open-payments/blob/main/.github/code_of_conduct.md).

### Reviews and approvals

After a PR is submitted, it will be reviewed by a member of the Interledger Foundation. Ensure you’re able to receive GitHub notifications so you’ll know when the PR is approved and can be merged, or if updates are required before approval is given.

### Authoring content

If you need help with authoring content, we suggest you refer to the [Starlight documentation](https://starlight.astro.build/guides/authoring-content/) for more detailed guidance.

Note that Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

⭐ We recommend using the `.mdx` extension whenever possible.

## Local development

Make sure all the dependencies for the website are installed. Because this is a monorepo, you should run the following command in the root of the project folder:

```sh
$ pnpm i
```

Run the dev server from the `/docs` folder:

```sh
$ pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

To build the site (this must be run from the `/docs` folder):

```sh
$ pnpm build
```

This command generates static content into the build directory and can be served using any static contents hosting service.

### 🧞 Commands

All commands are run from the `/docs` directory (or with `pnpm --filter docs <command>` from the repo root):

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm start`           | Starts local dev server.                         |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |
| `pnpm format`          | Format code and fix linting issues               |
| `pnpm lint`            | Check code formatting and linting                |

### 🔍 Code Formatting

This project uses [ESLint](https://eslint.org/) for code linting and [Prettier](https://prettier.io/) for code formatting. Before submitting a pull request, please ensure your code is properly formatted:

1. **Fix issues**: Run `pnpm format` to automatically format code and fix linting issues.
2. **Check before pushing**: Run `pnpm lint` to verify everything passes (CI will also run this).

ESLint is configured to work with TypeScript and Astro files. The configuration extends recommended rules from ESLint, TypeScript ESLint, and Astro ESLint plugins, and integrates with Prettier to avoid conflicts.

# Contributing to this repository <!-- omit in toc -->

Thank you for contributing to Open Payments :tada: Your contributions are essential to making this project better.

## Before you begin

- Have you read the [code of conduct](code_of_conduct.md)?
- Check out the [existing issues](https://github.com/interledger/open-payments/issues) & see if we [accept contributions](#types-of-contributions) for your type of issue.

## Table of Contents <!-- omit in toc -->

- [Types of contributions](#types-of-contributions)
  - [:mega: Discussions](#mega-discussions)
  - [:beetle: Issues](#beetle-issues)
  - [:hammer_and_wrench: Pull requests](#hammer_and_wrench-pull-requests)
- [Working in the Open Payments repository](#working-in-the-open-payments-repository)
  - [Code quality](#code-quality)
    - [Linting](#linting)
    - [Formatting](#formatting)
    - [Testing](#testing)
    - [Commit hooks](#commit-hooks)
    - [Language](#language)
    - [CI](#ci)
  - [Reporting Issues](#reporting-issues)
  - [Submitting Pull Requests](#submitting-pull-requests)
  - [Review Process](#review-process)

## Types of contributions

You can contribute to Open Payments in several ways.

### :mega: Discussions

Discussions are where we have conversations about Open Payments.

If you would like to discuss topics about the broader ecosystem, have a new idea, or want to show off your work - join us in [discussions](https://github.com/interledger/open-payments/discussions).

### :beetle: Issues

We use GitHub issues to track tasks that contributors can help with. We haven't finalized labels yet for contributors to tackle. If you want to help with work related to an issue, please comment on the issue before starting work on it.

If you've found something that needs fixing, search open issues to see if someone else has reported the same thing. If it's something new, open an issue. We'll use the issue to discuss the problem you want to fix.

### :hammer_and_wrench: Pull requests

Feel free to fork and create a pull request on changes you think you can contribute.

The team will review your pull request as soon as possible.

### :books: Documentation

We started to maintain public-facing documentation for Open Payments on [openpayments.dev](https://github.com/interledger/open-payments/tree/main/docs). The project is new, and available documentation is currently WIP.

## Working in the Open Payments repository

This project uses pnpm. A list of steps for setting up a [local development environment](https://github.com/interledger/open-paymentsi#local-development-environment) can be found in the Readme.

> DO NOT use `npm install`. This will cause the project to spontaneously self-destruct :boom:

### Labels

We use labels to communicate the intention of issues and PRs.

- `discussions:` prefix denotes issues that can be converted to discussions.
- `good first issue` are great issues for newcomers to take on.
- `pkg:` prefix denotes issues/PRs related to a specific package.
- `team:` prefix lets contributors know if the issue will be done by the core team or not.
- `triage` issues that the core team needs to assign labels to.
- `type:` prefix denotes a specific action/category to issues/PRs.

Some labels will be automatically assigned to PRs.

### Code quality

All the code quality tools used in the project are installed and configured at the root.
This allows for consistency across the monorepo. Allows new packages to be added with
minimal configuration overhead.

We try not to put config files in workspaces, unless absolutely necessary.

#### Linting

[Eslint](https://eslint.org/) is used for linting.

```shell
./.eslintrc.yml # config
./.eslintignore # ignore file
```

Eslint config should not be overridden in any packages.

#### Formatting

[Prettier](https://prettier.io/) is used for formatting.

```shell
./.prettierrc.yml # config
./.prettierignore # ignore file
```

Prettier config should not be overridden in any packages.

#### Testing

[Jest](https://jestjs.io/) is used for testing.

```shell
./jest.config.js # config used to configure projects and run all tests
./jest.config.base.js # (base jest config, imported by other packages)
./packages/*/jest.config.js # jest config file for package * (extends base.config.base.js)
```

Jest config at the root is intended to be a base config that should be extended by
each package to suit the package's testing requirements.

#### Commit hooks

[Husky](https://github.com/typicode/husky) provides git hooks.

```shell
./.husky/commit-msg # linting commit messages
./.husky/pre-commit # perform functions before committing
```

[Commitlint](https://commitlint.js.org/) is used for linting commit messages
so that they conform to [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

```shell
./commitlint.config.js # config
```

[Lint-staged](https://github.com/okonet/lint-staged) is used for linting and formatting staged files on commit.

```shell
./.lintstagedrc.yml # config
```

#### Language

[Typescript](https://www.staging-typescript.org/) is the chosen language.

```shell
./tsconfig.json # config
```

Typescript config at the root is intended to be a base config that should be extended by
each package to suit the package's requirements.

#### CI

We use GitHub actions to manage our CI pipeline.

The workflows can be found in `.github/workflows`

## Reporting Issues

If you encounter any issues or have a feature request, please [create a new issue](https://github.com/interledger/open-payments/issues/new) and provide the following details:

- A clear and descriptive title.
- A detailed description of the issue, including steps to reproduce if applicable.
- Information about your environment (e.g., operating system, browser, version).
- Any relevant screenshots or error messages.

## Submitting Pull Requests

1. [Fork](https://github.com/interledger/open-payments) the repository.
2. Create a new branch from `main`.
3. Make your changes and commit them.
4. Create a pull request (PR) to `main`.
5. Ensure your PR includes a clear title and description following the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/).
6. If your PR addresses an issue, reference the issue in the description using `Closes #123`.
7. Be patient and be prepared to address feedback and make changes if needed.

## Review Process

- Project maintainers will review your PR for code quality, correctness, and adherence to guidelines.
- Please respond to any feedback promptly and make necessary changes.
- Once the PR is approved, it will be merged into the main branch.

Thank you for contributing to Open Payments! We appreciate your time and effort in helping make Open Payments better. Join our community on [Slack](https://communityinviter.com/apps/interledger/interledger-working-groups-slack) to connect with other contributors and stay updated on project developments.

Happy coding!

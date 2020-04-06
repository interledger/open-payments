module.exports = {
  title: 'Open Payments',
  tagline: 'An inter-wallet payments protocol',
  url: 'https://docs.openpayments.dev',
  baseUrl: '/',
  favicon: 'img/Open Payments Logo.svg',
  organizationName: 'interledger',
  projectName: 'open-payments',
  themeConfig: {
    algolia: {
      apiKey: 'ca31c14c1bb6dd332787e02b5d03abfc',
      indexName: 'openpayments',
    },
    navbar: {
      title: 'Open Payments',
      hideOnScroll: true,
      logo: {
        alt: 'Open Payments',
        src: 'img/Open Payments Logo.svg',
        href: 'https://openpayments.dev',
        target: '_self',
      },
      links: [
        {
          label: 'Slack',
          position: 'right',
          href: 'https://communityinviter.com/apps/interledger/interledger-working-groups-slack',
        },
        {
          href: 'https://github.com/interledger/open-payments',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Specification',
              to: 'overview',
            },
            {
              label: 'Use Cases',
              to: 'checkout_push',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Slack',
              href: 'https://communityinviter.com/apps/interledger/interledger-working-groups-slack',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/interledger/open-payments',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        themes: ['@docusaurus/theme-classic', '@docusaurus/theme-search-algolia'],
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

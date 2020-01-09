/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}
  >
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
)

class Rafiki extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props
    const { baseUrl } = siteConfig

    return (
      <div>
        <Block background="light">
          {[
            {
              content:
                "<p>We've built a prototype wallet that uses Open Payments called Rafiki.</p>" +
                '<p>Check it out at <a href="https://rafiki.money">rafiki.money</a></p>',
              image: `${baseUrl}img/rafiki-money.png`,
              imageAlign: 'right',
              title: 'rafiki.money',
            }
          ]}
        </Block>
        <Block background="dark">
          {[
            {
              content:
                'There are also some demo stores that you can use to test the wallet for different use cases at ' +
                '<a href="https://rafiki.shop">rafiki.shop</a>',
              image: `${baseUrl}img/rafiki-shop.png`,
              imageAlign: 'left',
              title: 'rafiki.shop'
            }
          ]}
        </Block>
      </div>
    )
  }
}

module.exports = Rafiki

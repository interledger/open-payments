// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head> 
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik:400,500&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <link rel="shortcut icon" href="/favicon.svg" />
        </Head>
        <body className="bg-surface">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

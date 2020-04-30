import React from 'react'
import { NextPage } from 'next'
// import { UsersService } from '../services/users'
import { OpenPaymentsButton, Logo, Decor, Phone, Browser, Footer } from '../components'
import { useRouter } from 'next/router'

type sectionProps = {
  header ?: string
}

const Section: React.FC<sectionProps> = (props) => {
  return (
    <div className="flex flex-col text-left">
        <div className="mb-8 md:font-light text-2xl sm:text-4xl text-gray">
          {props.header}
        </div>
      {props.children}
    </div>
  )
}

const Divider: React.FC = () => {
  return (
      <div className="border-b border-gray border-opacity-12 my-20"/>
  )
}

const Card: React.FC = (props) => {
  let className = 'p-16 md:px-32 bg-white elevation-2 rounded lg:w-full mx-4'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

const Home: NextPage = () => {
  const router = useRouter()
  return (
    <div className="relative overflow-hidden w-full">
      <Decor/>
      <div className="container mx-auto flex flex-col text-left justify-center px-16 md:px-32 py-16">
        <div className="text-lg sm:text-xl md:text-3xl my-4">
          Brand guidelines
        </div>
        <div className="md:font-light text-3xl md:text-5xl text-primary">
          Representing the <br className="sm:hidden"/> Open Payments brand
        </div>
        {/* <div className="text-sm flex mt-6">
          Download all assets <i className={`material-icons ml-2`}>cloud_download</i>
        </div> */}
      </div>
      <div className="container mx-auto flex flex-col text-left justify-center py-12">
        <Card>
          <Section header="Logo">
            <div className="text-sm text-gray-light">
              Do not use the Open Payments mark or any variant of the Open Payments mark in conjunction with the overall name of your application, product, service, or website. 
              Do not alter or use the Open Payments mark in a way that may be confusing or misleading, and never use Open Payments branding as the most prominent element on your page. 
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                <div className="flex content-center h-64">
                  <img className="mx-auto self-center" src="/Standard lockup.png"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  Standard lockup<br/>
                  <p className="text-sm text-gray-light mt-4">
                    The standard lockup can be used in slide decks and blog posts.
                    <br/>
                    Whenever possible, the logo should be represented as a horizontal lockup with a full color logomark and #1E3250 or solid white logotype.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col pl-0 lg:pl-8">
                <div className="flex content-center h-64">
                  <Logo className="w-1/2 sm:w-1/4 mx-auto self-center"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  Logomark<br/>
                  <p className="text-sm text-gray-light mt-4">
                    When there is limited vertical and horizontal space, the logomark can be used by itself without the logotype. 
                  </p>
                </div>
              </div>
            </div>
          </Section>
          <Divider/>
          <Section header="Payment button">
            <div className="text-sm text-gray-light">
              These guidelines are to be used as a reference point when implementing an Open Payment payment button within your app or website.
              The Open Payments payment button must always use the Open Payments specification when making payments.
              <br/><br/>
              All Open Payments payment buttons within your app or website must adhere to our brand guidelines, which include, but are not limited to, the following requirements:
              <br/><br/>
              <ol className="list-disc list-inside">
                <li>The size and shape of the button must be relative to other buttons or similar elements on the page.</li>
                <li>The button colour must contrast with the background colour of the area surrounding it.</li>
                <li>Always maintain the minimum clear space of 8&nbsp;dp on all sides of the payment button.</li>
                <li>The button should have a minimum width of 90&nbsp;dp.</li>
                <li>The size and font of "Pay" on the button must remain constant. Rubik font family, with 400 weight and a minimum font size of 20.</li>
              </ol>
              <br/>
              Although Open Payments payment buttons must adhere to the above brand guidelines, specific implementations may vary to fit into the branding or style of your app or website, which can include:
              <br/><br/>
              <ol className="list-disc list-inside mb-8">
                <li>Variations in the button's corner radius and shape.</li>
                <li>Variations in the elevation or shadow of the button.</li>
                <li>Variations specific states of the button, such as disabled, hover, focussed, or pressed.</li>
              </ol>
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                <div className="flex content-center h-64 mb-8">
                  <OpenPaymentsButton className="w-1/2 sm:w-1/4 mx-auto self-center text-white bg-black elevation-2 hover:elevation-6"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  Black<br/>
                  <p className="text-sm text-gray-light mt-4">
                    Use black buttons on white or light backgrounds to provide contrast.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col pl-0 lg:pl-8">
                <div className="flex content-center h-64 bg-cyan-light rounded-full mb-8">
                  <OpenPaymentsButton className="w-1/2 sm:w-1/4 mx-auto self-center rounded-full bg-white elevation-6 hover:elevation-2"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  White<br/>
                  <p className="text-sm text-gray-light mt-4">
                    Use white buttons on dark or colorful backgrounds.
                  </p>
                </div>
              </div>
            </div>
          </Section>
          {/* <Divider/>
          <Section header="Pay mark">
            <div className="text-sm text-gray-light">
              Do not use the Open Payments mark or any variant of the Open Payments mark in conjunction with the overall name of your application, product, service, or website. 
              Do not alter or use the Open Payments mark in a way that may be confusing or misleading, and never use Open Payments branding as the most prominent element on your page. 
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                <div className="flex content-center h-64">
                  <img className="mx-auto self-center" src="/Standard lockup.png"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  Standard lockup<br/>
                  <p className="text-sm text-gray-light mt-4">
                    The standard lockup can be used in slide decks and blog posts.
                    <br/>
                    Whenever possible, the logo should be represented as a horizontal lockup with a full color logomark and #1E3250 or solid white logotype.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col pl-0 lg:pl-8">
                <div className="flex content-center h-64">
                  <Logo className="w-1/2 sm:w-1/4 mx-auto self-center"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  Logomark<br/>
                  <p className="text-sm text-gray-light mt-4">
                    When there is limited vertical and horizontal space, the logomark can be used by itself without the logotype. 
                  </p>
                </div>
              </div>
            </div>
          </Section>
          <Divider/>
          <Section header="In text">
            <div className="text-sm text-gray-light">
              Do not use the Open Payments mark or any variant of the Open Payments mark in conjunction with the overall name of your application, product, service, or website. 
              Do not alter or use the Open Payments mark in a way that may be confusing or misleading, and never use Open Payments branding as the most prominent element on your page. 
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                <div className="flex content-center h-64">
                  <img className="mx-auto self-center" src="/Standard lockup.png"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  Standard lockup<br/>
                  <p className="text-sm text-gray-light mt-4">
                    The standard lockup can be used in slide decks and blog posts.
                    <br/>
                    Whenever possible, the logo should be represented as a horizontal lockup with a full color logomark and #1E3250 or solid white logotype.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col pl-0 lg:pl-8">
                <div className="flex content-center h-64">
                  <Logo className="w-1/2 sm:w-1/4 mx-auto self-center"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  Logomark<br/>
                  <p className="text-sm text-gray-light mt-4">
                    When there is limited vertical and horizontal space, the logomark can be used by itself without the logotype. 
                  </p>
                </div>
              </div>
            </div>
          </Section> */}
        </Card>
      </div>
      <Footer bg="red">
        <div className="flex flex-col items-center justify-center text-white wrap">
          <div className="flex flex-row items-start justify-center w-full">
            <div className="flex flex-col w-card">
              <div className="text-lg font-medium mb-4">Protocol</div>
              <a className="text-base md:opacity-60 md:hover:opacity-100 mb-1" href="https://docs.openpayments.dev">
                Specification
              </a>
              <a className="text-base md:opacity-60 md:hover:opacity-100 mb-1" href="https://openpayments.dev/brand-guidelines">
                Brand guidelines
              </a>
            </div>
            <div className="flex flex-col w-card">
              <div className="text-lg font-medium mb-4">Community</div>
              <a className="text-base md:opacity-60 md:hover:opacity-100 mb-1" href="https://communityinviter.com/apps/interledger/interledger-working-groups-slack">
                Slack
              </a>
              <a className="text-base md:opacity-60 md:hover:opacity-100 mb-4" href="https://github.com/adrianhopebailie/open-payments">
                Github
              </a>
            </div>
          </div>
          <div className="w-full text-center sm:text-right text-xs">
            Copyright &copy; 2019 - {new Date().getFullYear()} Interledger Foundation
          </div>
        </div>
      </Footer>
    </div>
  )
}

export default Home

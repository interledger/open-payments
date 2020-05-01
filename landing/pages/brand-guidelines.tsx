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
  let className = 'p-8 sm:p-16 md:px-32 bg-white elevation-2 rounded lg:w-full mx-4'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

type colourBoxProps = {
  colour: string
  name: string
  padding?: string
}

const ColourBox: React.FC<colourBoxProps> = (props) => {
  return (
    <div className={`w-1/2 sm:w-1/3 lg:w-2/12 flex flex-col ${props.padding}`}>
      <div className={`bg-${props.colour} flex content-center h-24 sm:h-32 mb-2 rounded-md`}/>
      <div className="text-lg sm:text-xl text-gray mb-4">
        {props.name}
      </div>
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
        <div className="text-base flex mt-6">
          <a className="focus:outline-none align-middle flex flex-row" href="/Open_Payments_Brand_Assets.zip" download>
            <div>Download all assets </div><i className={`material-icons text-primary ml-2`}>get_app</i>
          </a>
        </div>
      </div>
      <div className="container mx-auto flex flex-col text-left justify-center py-12">
        <Card>
          <Section header="Logo">
            <div className="text-sm text-gray-light mb-16">
              Do not use the Open Payments mark or any variant of the Open Payments mark in conjunction with the overall name of your application, product, service, or website. 
              Do not alter or use the Open Payments mark in a way that may be confusing or misleading, and never use Open Payments branding as the most prominent element on your page. 
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray border-opacity-12 rounded-md">
                  <img className="mx-auto self-center w-3/4" src="/Open_Payments_standard_logo.svg"/>
                </div>
                <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                  Standard lockup<br/>
                  <p className="text-sm text-gray-light mt-4">
                    The standard lockup can be used in slide decks and blog posts.
                    <br/>
                    Whenever possible, the logo should be represented as a horizontal lockup with a full color logomark and #1E3250 or solid white logotype.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col pl-0 lg:pl-8">
                <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray border-opacity-12 rounded-md">
                  <img className="mx-auto self-center w-1/2 sm:w-1/4 " src="/Open_Payments_logomark.svg"/>
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
          <Section header="Colours">
            <div className="text-sm text-gray-light mb-16">
              The Open Payments logo consists of 12 colours, 6 base colours with a light variant each.
              There are two auxilary colours which are used for emphasis or text.
            </div>
            <div className="flex flex-row flex-wrap">
              <ColourBox colour="red" name="#CE6564" padding="pl-4 pr-4"/>
              <ColourBox colour="orange" name="#F47F5F" padding="pl-4 pr-4"/>
              <ColourBox colour="green" name="#6D995C" padding="pl-4 pr-4"/>
              <ColourBox colour="cyan" name="#459789" padding="pl-4 pr-4"/>
              <ColourBox colour="teal" name="#51797D" padding="pl-4 pr-4"/>
              <ColourBox colour="purple" name="#845578" padding="pl-4 pr-4"/>

              <ColourBox colour="red-light" name="#F59297" padding="pl-4 pr-4"/>
              <ColourBox colour="orange-light" name="#FCC9B3" padding="pl-4 pr-4"/>
              <ColourBox colour="green-light" name="#7FC78C" padding="pl-4 pr-4"/>
              <ColourBox colour="cyan-light" name="#8FD1C1" padding="pl-4 pr-4"/>
              <ColourBox colour="teal-light" name="#9EC7D0" padding="pl-4 pr-4"/>
              <ColourBox colour="purple-light" name="#978AA4" padding="pl-4 pr-4"/>

              <ColourBox colour="primary" name="#1E3250" padding="pl-4 pr-4"/>
              <ColourBox colour="orange-other" name="#FABD84" padding="pl-4 pr-4"/>
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
              <ol className="list-disc list-inside mb-16">
                <li>The size and shape of the button must be relative to other buttons or similar elements on the page.</li>
                <li>The button colour must contrast with the background colour of the area surrounding it.</li>
                <li>Always maintain the minimum clear space of 8&nbsp;dp on all sides of the payment button.</li>
                <li>The button should have a minimum width of 90&nbsp;dp.</li>
                <li>The size and font of "Pay" on the button must remain constant. Rubik font family, with 400 weight and a minimum font size of 20.</li>
              </ol>
              <div className="flex flex-col lg:flex-row mb-16">
                <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                  <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray border-opacity-12 rounded-md">
                    <OpenPaymentsButton className="mx-auto self-center rounded-md text-white bg-black elevation-3"/>
                  </div>
                  <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                    Black<br/>
                    <p className="text-sm text-gray-light mt-4">
                      Use black buttons on white or light backgrounds to provide contrast.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col pl-0 lg:pl-8">
                  <div className="flex content-center h-48 sm:h-56 bg-cyan-light rounded-md mb-4">
                    <OpenPaymentsButton className="mx-auto self-center rounded-md text-black bg-white elevation-3"/>
                  </div>
                  <div className="text-lg sm:text-xl text-gray">
                    White<br/>
                    <p className="text-sm text-gray-light mt-4">
                      Use white buttons on dark or colorful backgrounds.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-16">
                Although Open Payments payment buttons must adhere to the above brand guidelines, specific implementations may vary to fit into the branding or style of your app or website, which can include:
              </div>
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 flex flex-col pr-0 lg:pr-8">
                <div className="flex content-center h-48 sm:h-56 bg-cyan-light rounded-full mb-4">
                  <OpenPaymentsButton className="w-8/12 mx-auto self-center rounded-full text-black bg-white elevation-3"/>
                </div>
                <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                  Shape<br/>
                  <p className="text-sm text-gray-light mt-4">
                    Variations in the button's corner radius and shape, to match other elements on the page. Note the larger width and corner radius.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/3 flex flex-col px-0 lg:px-8">
                <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray border-opacity-12 rounded-md">
                  <OpenPaymentsButton className="mx-auto self-center rounded-md text-white bg-black elevation-8"/>
                </div>
                <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                  Elevation<br/>
                  <p className="text-sm text-gray-light mt-4">
                    Variations in the elevation or shadow of the button. Note the higher elevation.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/3 flex flex-col pl-0 lg:pl-8">
                <div className="flex content-center h-48 sm:h-56 bg-cyan-light rounded-md mb-4">
                  <OpenPaymentsButton className="mx-auto self-center rounded-md text-black bg-white elevation-1 hover:elevation-6 focus:elevation-24"/>
                </div>
                <div className="text-lg sm:text-xl text-gray">
                  State<br/>
                  <p className="text-sm text-gray-light mt-4">
                    Variations specific states of the button, such as active, hover, or focus. Note the change in elevation with the various states.
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
                <div className="flex content-center h-48 sm:h-56">
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
                <div className="flex content-center h-48 sm:h-56">
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
                <div className="flex content-center h-48 sm:h-56">
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
                <div className="flex content-center h-48 sm:h-56">
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

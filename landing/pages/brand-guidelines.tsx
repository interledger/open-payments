import React from 'react'
import { NextPage } from 'next'
// import { UsersService } from '../services/users'
import { OpenPaymentsButton, Decor, Footer } from '../components'
import { useRouter } from 'next/router'

type sectionProps = {
  header ?: string
  children?: any
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
      <div className="border-b border-gray/12 my-20"/>
  )
}

type cardProps = {
  children?: any
}

const Card: React.FC<cardProps> = (props) => {
  let className = 'p-8 sm:p-16 bg-white shadow-md rounded w-full'
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
    <div className={`w-full lg:w-2/12 flex flex-col ${props.padding}`}>
      <div className={`bg-${props.colour} flex content-center h-12 sm:h-16 mb-2 rounded-md`}/>
      <div className="text-base text-gray mb-4">
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
          <a className="focus:outline-none hover:text-orange-other text-primary align-middle flex flex-row" href="/Open_Payments_Brand_Assets.zip" download>
            <div>Download all assets </div><i className={`material-icons ml-2`}>get_app</i>
          </a>
        </div>
      </div>
      <div className="container mx-auto flex flex-col text-left justify-center py-12 px-4 sm:px-12">
        <Card>
          <Section header="Logo">
            <div className="text-sm text-gray-light mb-16">
              Do not use the Open Payments mark or any variant of the Open Payments mark in conjunction with the overall name of your application, product, service, or website. 
              Do not alter or use the Open Payments mark in a way that may be confusing or misleading, and never use Open Payments branding as the most prominent element on your page. 
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                <div className="flex content-center h-48 sm:h-56 mb-4 p-8 border border-gray/12 rounded-md">
                  <img className="mx-auto self-center max-w-full" src="/Open_Payments_standard_logo.svg" alt='Logo'/>
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
                <div className="flex content-center h-48 sm:h-56 mb-4 p-8 border border-gray/12 rounded-md">
                  <img className="mx-auto self-center max-h-full" src="/Open_Payments_logomark.svg" alt='Logo'/>
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
            <div className="flex flex-row lg:flex-col">
              <div className="flex flex-col lg:flex-row w-full">
                <ColourBox colour="red" name="#CE6564" padding="px-2 sm:px-4"/>
                <ColourBox colour="orange" name="#F47F5F" padding="px-2 sm:px-4"/>
                <ColourBox colour="green" name="#6D995C" padding="px-2 sm:px-4"/>
                <ColourBox colour="cyan" name="#459789" padding="px-2 sm:px-4"/>
                <ColourBox colour="teal" name="#51797D" padding="px-2 sm:px-4"/>
                <ColourBox colour="purple" name="#845578" padding="px-2 sm:px-4"/>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <ColourBox colour="red-light" name="#F59297" padding="px-2 sm:px-4"/>
                <ColourBox colour="orange-light" name="#FCC9B3" padding="px-2 sm:px-4"/>
                <ColourBox colour="green-light" name="#7FC78C" padding="px-2 sm:px-4"/>
                <ColourBox colour="cyan-light" name="#8FD1C1" padding="px-2 sm:px-4"/>
                <ColourBox colour="teal-light" name="#9EC7D0" padding="px-2 sm:px-4"/>
                <ColourBox colour="purple-light" name="#978AA4" padding="px-2 sm:px-4"/>
              </div>
            </div>
            <div className="text-lg sm:text-xl text-gray mb-16">
              Logo<br/>
              <p className="text-sm text-gray-light mt-4">
              The Open Payments logo consists of 6 base colours, each with a light secondary variant.
              </p>
            </div>
            <div className="flex flex-row lg:hidden">
              <div className="flex flex-col lg:flex-row w-full">
                <ColourBox colour="primary" name="#1E3250" padding="px-2 sm:px-4"/>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <ColourBox colour="orange-other" name="#FABD84" padding="px-2 sm:px-4"/>
              </div>
            </div>
            <div className="hidden flex-row lg:flex">
              <div className="flex flex-col lg:flex-row w-full">
                <ColourBox colour="primary" name="#1E3250" padding="px-2 sm:px-4"/>
                <ColourBox colour="orange-other" name="#FABD84" padding="px-2 sm:px-4"/>
              </div>
            </div>
            <div className="text-lg sm:text-xl text-gray">
              Emphasis<br/>
              <p className="text-sm text-gray-light mt-4">
              There are two auxilary colours which are used for emphasis or text.
              </p>
            </div>
          </Section>
          <Divider/>
          <Section header="Payment button">
            <div className="text-sm text-gray-light">
              These guidelines are to be used as a reference point when implementing an Open Payments payment button within your app or website.
              The Open Payments payment button must always use the Open Payments specification when making payments.
              <br/><br/>
              <div className="mb-16">
                All Open Payments payment buttons within your app or website must adhere to our brand guidelines, which include, but are not limited to, the following requirements:
              </div>
              <div className="flex flex-col lg:flex-row mb-16">
                <div className="w-full lg:w-1/3 flex flex-col pr-0 lg:pr-8">
                  <div className="flex content-center h-48 sm:h-56 mb-4 p-8 border border-gray/12 rounded-md">
                    <img className="mx-auto self-center max-w-full" src="/Specification.svg" alt='a specification image'/>
                  </div>
                  <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                    Specification<br/>
                    <p className="text-sm text-gray-light mt-4">
                      Open Payments logo size 24&nbsp;dp.<br/>
                      Minimum width 90&nbsp;dp, and minimum height 48&nbsp;dp.<br/>
                      Minimum <span className="text-teal-light font-bold">8&nbsp;dp margin</span> on all sides of the button.<br/>
                      Minimum <span className="text-orange-light font-bold">8&nbsp;dp padding</span> between elements inside the button.<br/>
                      Content must be vertically centered.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-1/3 flex flex-col px-0 lg:px-8">
                  <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray/12 rounded-md">
                    <div className="flex content-center w-full h-full rounded-l-md text-white bg-cyan-light">
                      <OpenPaymentsButton verb="Pay" className="mx-auto self-center rounded-md text-black bg-white shadow-lg"/>
                    </div>
                    <div className="flex content-center w-full h-full rounded-md text-white">
                      <OpenPaymentsButton verb="Pay" className="mx-auto self-center rounded-md text-white bg-black shadow-lg"/>
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                    Contrast<br/>
                    <p className="text-sm text-gray-light mt-4">
                      The button colour must contrast with the background colour of the surrounding area.<br/>
                      Use white buttons on dark or colourful backgrounds.<br/>
                      Use black buttons on white or light background.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-1/3 flex flex-col pl-0 lg:pl-8">
                  <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray/12 rounded-md">
                    <div className="flex content-center w-full h-full text-black border-r border-gray/12">
                      <span className="w-full text-right mr-2 self-center text-md">
                      Rubik<br/>
                      Regular<br/>
                      20
                      </span>
                    </div>
                    <div className="flex content-center w-full h-full text-black">
                      <span className=" ml-2 self-center text-xl">Button</span>
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl text-gray">
                    Text<br/>
                    <p className="text-sm text-gray-light mt-4">
                      The text on the button must be a single, title case, verb. For example, Pay, Tip, Donate, Subscribe, Buy, etc.<br/>
                      The text should always be to the right of the logo.
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
                  <OpenPaymentsButton verb="Donate" className="w-8/12 mx-auto self-center rounded-full text-black bg-white shadow-lg"/>
                </div>
                <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                  Shape<br/>
                  <p className="text-sm text-gray-light mt-4">
                    Variations in the button&apos;s corner radius and shape, to match other elements on the page. Note the larger width and corner radius.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/3 flex flex-col px-0 lg:px-8">
                <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray/12 rounded-md">
                  <OpenPaymentsButton verb="Tip" className="mx-auto self-center rounded-md text-white bg-black shadow-2xl"/>
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
                  <OpenPaymentsButton verb="Subscribe" className="mx-auto self-center rounded-md text-black bg-white shadow-sm hover:shadow-xl focus:shadow-2xl"/>
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
          <Divider/>
          <Section header="Pay mark">
          <div className="text-sm text-gray-light">
              The Open Payments pay mark should be used when displaying Open Payments as a payment option in a payment flow.
              <div className="flex flex-col lg:flex-row my-16">
                <div className="w-full lg:w-1/2 flex flex-col pr-0 lg:pr-8">
                  <div className="flex content-center h-48 sm:h-56 mb-4 border border-gray/12 rounded-md">
                    <img className="mx-auto self-center w-1/2 sm:w-1/4 " src="/Open_Payments_mark.svg" alt='Logo' />
                  </div>
                  <div className="text-lg sm:text-xl text-gray mb-16 lg:mb-0">
                    Mark<br/>
                    <p className="text-sm text-gray-light mt-4">
                      Do not change the color or weight of the mark&apos;s outline or alter the mark in any way. Use only the mark provided by Open Payments.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 flex flex-col pl-0 lg:pl-8">
                  <div className="flex flex-col p-4 justify-center h-48 sm:h-56 mb-4 border border-gray/12 rounded-md">
                    <div className="flex">
                      <div className="text-primary align-middle h-12 flex flex-row justify-between" >
                        <div className="flex flex-row">
                          <img className="m-2 w-2/12 sm:1/12" src="/Open_Payments_mark.svg" alt='Logo' />
                          <div className="text-xs my-auto">Open Payments</div>
                        </div>
                        <i className={`self-center material-icons`}>navigate_next</i>
                      </div>
                    </div>
                    <div className="border-b border-gray/12"/>
                    <div className="flex">
                      <div className="text-primary align-middle h-12 flex flex-row justify-between" >
                        <div className="flex flex-row">
                          <img className="m-2 w-2/12 sm:1/12" src="/Rafiki Mark.svg" alt='Rafiki logo' />
                          <div className="text-xs my-auto">Generic Pay</div>
                        </div>
                        <i className={`self-center material-icons`}>navigate_next</i>
                      </div>
                    </div>
                    <div className="border-b border-gray/12"/>
                    <div className="flex">
                      <div className="text-primary align-middle h-12 flex flex-row justify-between" >
                        <div className="flex flex-row">
                          <img className="m-2 w-2/12 sm:1/12" src="/CARD Mark.svg" alt='card logo' />
                          <div className="text-xs my-auto">**** 4242</div>
                        </div>
                        <i className={`self-center material-icons`}>navigate_next</i>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl text-gray">
                    Size<br/>
                    <p className="text-sm text-gray-light mt-4">
                      If needed, adjust the height of the mark to match other brand identities displayed in your payment flow. Always maintain the minimum clear space of 8&nbsp;dp on all sides of the mark.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

export default Home

import React from 'react'
import { NextPage } from 'next'
// import { UsersService } from '../services/users'
import { Button, Logo, Decor, Phone, Browser, Footer } from '../components'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const router = useRouter()
  return (
    <div className="relative overflow-hidden w-full">
      <Decor/>
      {/* SCREEN 1 */}
      <div className="flex w-full h-screen">
        <div className="flex flex-col w-full sm:w-1/2 text-left sm:text-right h-full justify-center items-start sm:items-end self-start sm:self-end pl-12 sm:pr-12">
          <Logo className="h-200 w-200 sm:h-200 sm:w-200"/>
          <div className="md:font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-primary mt-6">
            Open Payments
          </div>
          <div className="text-lg sm:text-xl md:text-4xl lg:text-3xl xl:text-4xl my-6">
            An inter-wallet <br className="sm:hidden"/> payments protocol
          </div>
          <div className="my-6">
            <Button onClick={() => window.location.href = 'https://docs.openpayments.guide'}>
              Read the docs
            </Button>
          </div>
          <div className="text-sm flex mt-6">
            or continue reading <i className={`material-icons ml-2`}>arrow_downward</i>
          </div>
        </div>
      </div>
      {/* SCREEN 2 */}
      <div className="flex flex-col sm:flex-row w-full sm:h-screen wrap">
        <div className="flex flex-col w-full sm:w-1/2 text-right h-full justify-center items-center self-center sm:items-end sm:self-end sm:pr-12">
          <Phone className="sm:mr-24 my-16 sm:my-0 w-phone"/>
        </div>
        <div className="flex flex-col w-full sm:w-1/2 text-left h-full justify-center items-start self-start px-12 sm:px-12">
          <div className="text-2xl md:text-4xl text-primary my-6">
            For applications
          </div>
          <div className="text-lg md:w-1/2 my-6 leading-relaxed">
            Open Payments allows easy integration into new or existing applications that require the use of a digital wallet.
            <br/>
            <br/>
            Facilitating the discovery, setup and authorization of payments between different wallet providers; so you don&apos;t have to.
          </div>
          <div className="my-6">
            <Button onClick={() => window.location.href = 'https://docs.openpayments.guide'}>
              Read the docs
            </Button>
          </div>
        </div>
      </div>
      {/* SCREEN 3 */}
      <div className="flex flex-col-reverse sm:flex-row w-full sm:h-screen wrap">
        <div className="flex flex-col w-full sm:w-1/2 text-right h-full justify-center items-end self-end px-12 sm:pl-12">
          <div className="text-3xl md:text-4xl text-primary my-6">
            For wallets
          </div>
          <div className="text-lg md:w-1/2 my-6 leading-relaxed">
            Open Payments allows for seamless, secure, easy inter-wallet payments. 
            <br/>
            <br/>
            Facilitating the discovery, setup and authorization of payments with other wallet providers; so you don&apos;t have to.
          </div>
          <div className="my-6">
            <Button onClick={() => window.location.href = 'https://docs.openpayments.guide'}>
              Read the docs
            </Button>
          </div>
        </div>
        <div className="flex flex-col w-full sm:w-1/2 h-full justify-center items-center self-center sm:items-start sm:self-start sm:pl-12">
          <Browser className="sm:ml-24 my-16 sm:my-0 w-browser-mobile sm:w-browser"/>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home

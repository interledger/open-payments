import React from 'react'
import { NextPage } from 'next'
// import { UsersService } from '../services/users'
import { Button, Logo, Decor, Phone, Browser, Footer } from '../components'
import { useRouter } from 'next/router'

const Wallets: NextPage = () => {
  const router = useRouter()
  return (
    <div className="relative overflow-hidden w-full">
      <Decor/>
      {/* SCREEN 1 */}
      <div className="flex w-full h-screen">
        <div className="flex flex-col w-full sm:w-1/2 text-left sm:text-right h-full justify-center items-start sm:items-end self-start sm:self-end pl-12 sm:pr-12">
          <Logo className="h-90 w-90 sm:h-200 sm:w-200"/>
          <div className="text-headline-4 sm:font-light sm:text-headline-1 text-primary mt-6">
            Open Payments
          </div>
          <div className="text-subtitle-1 sm:text-headline-4 my-6">
            An inter-wallet <br className="sm:hidden"/> payments protocol
          </div>
          <div className="my-6">
            <Button onClick={() => window.location.href = 'https://docs.openpayments.guide'}>
              Read the docs
            </Button>
          </div>
          <div className="flex my-6">
            or continue reading <i className={`material-icons ml-2`}>arrow_downward</i>
          </div>
        </div>
      </div>
      {/* SCREEN 2 */}
      <div className="flex w-full h-screen wrap">
        <div className="flex flex-col w-1/2 text-right h-full justify-center items-end self-end pr-12">
          <Phone className="mr-24 w-phone"/>
        </div>
        <div className="flex flex-col w-1/2 text-left h-full justify-center items-start self-start pl-12">
          <div className="text-primary headline-4 my-6">
            For applications
          </div>
          <div className="w-1/2 my-6">
            Open Payments allows easy integration into new or existing applications that require the use of a digital wallet.
            Facilitating the discovery, setup and authorization of payments between different wallet providers; so you don't have to.
          </div>
          <div className="my-6">
            <Button onClick={() => window.location.href = 'https://docs.openpayments.guide'}>
              Learn more
            </Button>
          </div>
        </div>
      </div>
      {/* SCREEN 3 */}
      <div className="flex w-full h-screen wrap">
        <div className="flex flex-col w-1/2 text-right h-full justify-center items-end self-end pr-12">
          <div className="text-primary headline-4 my-6">
            For wallets
          </div>
          <div className="w-1/2 my-6">
            Open Payments allows easy integration into new or existing applications that require the use of a digital wallet.
            Facilitating the discovery, setup and authorization of payments between different wallet providers; so you don't have to.
          </div>
          <div className="my-6">
            <Button onClick={() => window.location.href = 'https://docs.openpayments.guide'}>
              Learn more
            </Button>
          </div>
        </div>
        <div className="flex flex-col w-1/2 text-right h-full justify-center items-start self-start pl-12">
          <Browser className="ml-24 w-browser"/>
        </div>
      </div>
      <Footer>
        hello
      </Footer>
    </div>
  )
}

export default Wallets

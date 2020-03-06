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
      <div className="flex w-full h-screen">
        <div className="mx-auto mt-12 text-center">
          <div className="flex justify-center">
            <Logo height={80}/>
            <div className="ml-4 text-primary headline-5 self-center">
              Open Payments
            </div>
          </div>
          
          <div className="text-primary headline-4 mt-6 mx-12">
            An inter-wallet payments protocol.
          </div>
          <div className="flex flex-row justify-center my-8">
            <Button onClick={() => window.location.href = 'https://docs.openpayments.dev'}>
              Read the docs
            </Button>
          </div>
          <p className="mt-2">or learn about specific<br/>use cases below.</p>
        </div>
      </div>
      <div className="flex w-full h-screen">
        <div className="my-auto">
          <div className="flex">
            <div className="mx-12 text-primary headline-4">
            For applications
          </div>
          </div>
          
          <div className="mx-12 body-1 mt-6">
          Open Payments allows easy integration into new or existing applications that require the use of a digital wallet.
          <br/>
          Facilitating the discovery and setup of payments between different wallet providers so you don't have to.
          </div>
          <div className="flex flex-row mt-8 mx-12">
            <div className="flex-none" >
              <Button onClick={() => router.push('/signup')}>
                Learn more
              </Button>
            </div>
            <Phone className="flex-shrink ml-6"/>
          </div>
        </div>
      </div>
      <div className="flex w-full h-screen">
        <div className="my-auto">
          <div className="flex">
            <div className="mx-12 text-primary headline-4">
            For wallets
          </div>
          </div>
          
          <div className="mx-12 body-1 mt-6">
          Open Payments allows easy integration into new or existing applications that require the use of a digital wallet.
          <br/>
          Facilitating the discovery and setup of payments between different wallet providers so you don't have to.
          </div>
          <div className="flex flex-row mt-8 mx-12">
            <div className="flex-shrink" >
              <Button onClick={() => router.push('/signup')}>
                Learn more
              </Button>
            </div>
          </div>
          <div className="flex flex-row mt-8 mx-12">
            <div className="flex-shrink" >
              <Browser className="flex-shrink mx-auto w-full"/>
            </div>
          </div>
        </div>
      </div>
      <Footer>
        hello
      </Footer>
    </div>
  )
}

export default Home

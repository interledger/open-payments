import Link from 'next/link'
import * as React from 'react'

type props = {
  bg?: string
  children?: any
}

const Footer: React.FC<props> = (props) => {
  return ( 
    <footer className="bg-red w-full p-16">
        <div className="flex flex-col items-center justify-center text-white wrap">
          <div className="flex flex-row items-start justify-center w-full">
            <div className="flex flex-col w-card">
              <div className="text-lg font-medium mb-4">Protocol</div>
              <a className="text-base md:opacity-60 md:hover:opacity-100 mb-1" href="https://docs.openpayments.guide">
                Specification
              </a>
              <Link className="text-base md:opacity-60 md:hover:opacity-100 mb-1" href="/brand-guidelines">
                Brand guidelines
              </Link>
            </div>
            <div className="flex flex-col w-card">
              <div className="text-lg font-medium mb-4">Community</div>
              <a className="text-base md:opacity-60 md:hover:opacity-100 mb-1" href="https://communityinviter.com/apps/interledger/interledger-working-groups-slack">
                Slack
              </a>
              <a className="text-base md:opacity-60 md:hover:opacity-100 mb-4" href="https://github.com/interledger/open-payments">
                Github
              </a>
            </div>
          </div>
          <div className="w-full text-center sm:text-right text-xs">
            Copyright &copy; 2019 - {new Date().getFullYear()} Interledger Foundation
          </div>
        </div>
      </footer>
  )
}

export default Footer

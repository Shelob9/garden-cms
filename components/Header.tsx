import Link from "next/link";
import { FC, Fragment } from "react";
import useIsLoggedInAuthorized from "../hooks/useIsLoggedAuthorized";
import DarkModeToggle from "./DarkModeToggle";

const Header: FC<{
  BeforeControls?: () => JSX.Element;
  pageDisplayTitle: string;
  statusMessage?: string;

}> = ({ BeforeControls,pageDisplayTitle,statusMessage }) => {
  const { isLoggedIn,isSessionLoading } = useIsLoggedInAuthorized();
  return (
      <>
        <header id="header">
          <a aria-current="page" className="" href="/gatsby-digital-garden/">
            <h3>{pageDisplayTitle}</h3>
        </a>
        {statusMessage && <span>{statusMessage}</span>}
        {BeforeControls && <BeforeControls /> }
          <div className={'controls'}>
          <DarkModeToggle />
          {isSessionLoading
            ? <span style={{ width: '42px' }} /> : <Link href={isLoggedIn ? '/notes/new' : '/login'}><button>{isLoggedIn ? "New" : "Login"}</button></Link>
          }
          </div>
        </header>
      <style jsx>{`
        #header {
          padding-left: 32px;
          padding-right: 32px;
          width: 100%;
          min-height: 57px;
          z-index: 5;
          background-color: var(--note-bg);
          border-bottom: 1px solid var(--separator);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          padding-bottom: 10px;
          flex-wrap: wrap;
          transition: background-color 0.3s ease;
        }
        
        #header > a {
          font-weight: 700;
          color: var(--text);
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        #header .controls {
          display: flex;
        }
      `}
      </style>
      </>
      
      
    )
}
  
export default Header;
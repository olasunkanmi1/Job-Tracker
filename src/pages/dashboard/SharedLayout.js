import {useEffect} from 'react'
import { Outlet } from 'react-router-dom'
import Wrapper from '../../assets/wrappers/SharedLayout'
import { Navbar, BigSidebar, SmallSidebar } from '../../components'
import { useAppContext } from '../../context/appContext'

const SharedLayout = () => {
  // const {clearAlert} = useAppContext;
  // useEffect(() => {
  //   clearAlert()
  // }, [clearAlert])

  return (
    <Wrapper>
      <main className='dashboard'>
        <SmallSidebar />
        <BigSidebar />

        <div>
          <Navbar />
          <div className='dashboard-page'>
            <Outlet />
          </div>
        </div>
      </main>
    </Wrapper>
  )
}

export default SharedLayout

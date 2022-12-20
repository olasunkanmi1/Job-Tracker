import Wrapper from '../assets/wrappers/SmallSidebar'
import { FaTimes } from 'react-icons/fa';
import { useAppContext } from '../context/appContext';
import Logo from './Logo';
import NavLinks from './NavLinks'

const SmallSidebar = () => {
    const { showSidebar, toggleSidebar } = useAppContext();

  return (
    <Wrapper>
        <div className={showSidebar ? 'sidebar-container show-sidebar' : 'sidebar-container'}>
            <div className='content'>
                <button className='close-btn' onClick={toggleSidebar}>
                    <FaTimes />
                </button>
                <header>
                    <Logo />
                </header>
                <div className='nav-links'>
                    <NavLinks toggleSidebar={toggleSidebar} />
                </div>
            </div>
        </div>
    </Wrapper>
  )
}
export default SmallSidebar
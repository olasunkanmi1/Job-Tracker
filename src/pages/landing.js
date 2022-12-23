import Wrapper from '../assets/wrappers/LandingPage'
import { Logo } from '../components'
import main from '../assets/images/main.svg'
import { Link } from 'react-router-dom'
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/appContext';

const Landing = () => {
  const { user } = useAppContext();

  return (
    <>
      {user && <Navigate to='/' />}

      <Wrapper>
          <nav>
            <Logo />
          </nav>
          <div className='container page'>
            {/* info */}
            <div className='info'>
              <h1> job <span>tracking</span> app </h1>
              <p> Vice cardigan actually crucifix. Hashtag enamel pin ethical XOXO flexitarian vegan flannel health goth. Sriracha synth palo santo, leggings selfies PBR&B 3 wolf moon stumptown tbh paleo kickstarter. Semiotics chambray +1 banh mi vibecession everyday carry DIY poutine vinyl godard four dollar toast seitan vape skateboard literally. Shaman literally cloud bread actually austin, unicorn edison bulb VHS jianbing intelligentsia church-key big mood </p>
              <Link to='/register' className='btn btn-hero'>
                Login / Register
              </Link>
            </div>

            <img src={main} alt='job hunt' className='img main-img' />
          </div>
      </Wrapper>
    </>
  )
}

export default Landing
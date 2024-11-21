import { useState } from 'react'
import './Login.css'
import Attend from './loginComponents/Attend'
import Info from './loginComponents/Info'
import LoginForm from './loginComponents/LoginForm'
import Main from './loginComponents/Main'
import Notice from './loginComponents/Notice'
import logo from './images/hansei.png'


function Login({setPage}) {
    const handlePage = () => {
        setPage('main')
    }
    const [pages, setPages] = useState('');
    const handlePages = (args) => {
        setPages(args)
    }
    const renderComponents = {
        main: <Main />,
        loginForm: <LoginForm />,
        notice: <Notice />,
        info: <Info />,
        attend: <Attend />
    }


    return (
        <div className="center">
          {/* 메인 페이지로 돌아가는 버튼 */}
          <button onClick={handlePage} className="button sidebutton">
            메인
          </button>
    
          {/* 헤더에 있는 상태 변경 버튼 */}
          <div className="header">
            <button onClick={() => handlePages('main')} className='img'>
              <img src={logo} alt='logo' />
            </button>
            <button onClick={() => handlePages('loginForm')} className="button">
              로그인
            </button>
            <button onClick={() => handlePages('notice')} className="button">
              공지사항
            </button>
            <button onClick={() => handlePages('info')} className="button">
              학생 정보
            </button>
            <button onClick={() => handlePages('attend')} className="button">
              출석부
            </button>
          </div>
    
          {/* 조건부 렌더링 */}
          <div className="container">
            {renderComponents[pages] || <div>Default Content</div>}
          </div>
        </div>
      );
    }
export default Login;
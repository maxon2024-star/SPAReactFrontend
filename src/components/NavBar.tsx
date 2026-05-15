import type { FC } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '../Routes';
import { logout } from '../slices/authSlice';
import { clearDraftAndFilters } from '../slices/applicationSlice';
import type { RootState, AppDispatch } from '../store';

export const NavBar: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { isAuth, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    // При выходе сбрасываем авторизацию, а также черновик и фильтры по ТЗ
    dispatch(logout());
    dispatch(clearDraftAndFilters());
    navigate(ROUTES.RADIATIONS);
  };

  return (
    <Navbar bg="white" expand="lg" className="mb-4 rounded shadow-sm border">
      <Container>
        <Navbar.Brand as={Link as any} to={ROUTES.RADIATIONS} className="fw-bold text-primary fs-4">
          ⚡Рассчет фотоэффекта
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuth ? (
              <>
                <span className="me-3 fw-bold text-secondary">
                  Привет, {user?.login || 'Пользователь'}
                </span>
                
                {/* Ссылки вместо кнопок */}
                <Nav.Link as={Link as any} to={ROUTES.CALCULATIONS} className="me-3 fw-bold text-dark">
                  Журнал заявок
                </Nav.Link>
                
                <Nav.Link onClick={handleLogout} className="text-danger fw-bold">
                  Выход
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link as any} to={ROUTES.LOGIN} className="me-2 fw-bold text-primary">
                  Вход
                </Nav.Link>
                <Nav.Link as={Link as any} to={ROUTES.REGISTER} className="fw-bold text-primary">
                  Регистрация
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
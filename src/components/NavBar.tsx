import type { FC } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '../Routes';
import { logout } from '../slices/authSlice';
import { clearDraftAndFilters } from '../slices/applicationSlice';
import type { RootState } from '../store';

export const NavBar: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const { draftId } = useSelector((state: RootState) => state.applications);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearDraftAndFilters());
    navigate(ROUTES.RADIATIONS);
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4 main-header" style={{ borderRadius: '12px' }}>
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.RADIATIONS} className="app-title">⚡ Фотоэффект</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuth ? (
              <>
                <span className="me-3 fw-bold">Привет, {user?.login || 'Пользователь'}</span>
                <Button 
                  as={Link} 
                  to={ROUTES.CALCULATIONS}
                  variant="info"
                  className="me-2"
                >
                  Все заявки
                </Button>
                <Button 
                  as={Link} 
                  to={draftId ? `${ROUTES.CALCULATIONS}/${draftId}` : '#'}
                  variant={draftId ? "primary" : "secondary"}
                  disabled={!draftId}
                  className="me-3"
                >
                  Черновик {draftId && `(#${draftId})`}
                </Button>
                <Button variant="outline-danger" onClick={handleLogout}>Выход</Button>
              </>
            ) : (
              <>
                <Button as={Link} to={ROUTES.LOGIN} variant="outline-primary" className="me-2">Вход</Button>
                <Button as={Link} to={ROUTES.REGISTER} variant="primary">Регистрация</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
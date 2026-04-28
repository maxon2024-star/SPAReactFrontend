import type { FC } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '../Routes';
import { logout } from '../slices/authSlice';
import { clearDraftAndFilters } from '../slices/applicationSlice';

export const NavBar: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth, user } = useSelector((state: any) => state.auth);
  const { draftId } = useSelector((state: any) => state.applications);

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
          <Nav className="me-auto">
            <Nav.Link as={Link} to={ROUTES.RADIATIONS}>Каталог излучений</Nav.Link>
            {isAuth && <Nav.Link as={Link} to="/applications">Мои заявки</Nav.Link>}
          </Nav>
          <Nav className="ms-auto align-items-center">
            {isAuth ? (
              <>
                <span className="me-3">Привет, {user?.login || 'Пользователь'}</span>
                <Button 
                  as={Link} 
                  to={draftId ? `/applications/${draftId}` : '#'}
                  variant={draftId ? "primary" : "secondary"}
                  disabled={!draftId}
                  className="me-2"
                >
                  Черновик
                </Button>
                <Button variant="outline-danger" onClick={handleLogout}>Выход</Button>
              </>
            ) : (
              <Button as={Link} to="/login" variant="primary">Вход</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
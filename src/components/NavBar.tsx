import type { FC } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
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
  const { draftId } = useSelector((state: RootState) => state.applications);

  const handleLogout = () => {
    // При выходе сбрасываем авторизацию, а также черновик и фильтры по ТЗ
    dispatch(logout());
    dispatch(clearDraftAndFilters());
    navigate(ROUTES.RADIATIONS);
  };

  return (
    <Navbar bg="white" expand="lg" className="mb-4 rounded shadow-sm border">
      <Container>
        <Navbar.Brand as={Link as any}to={ROUTES.RADIATIONS} className="fw-bold text-primary fs-4">
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
                
                <Button 
                  as={Link as any}
                  to={ROUTES.CALCULATIONS}
                  variant="outline-info"
                  className="me-2"
                >
                  Все расчеты (Журнал)
                </Button>
                
                {/* ТЗ: Если черновик есть - кнопка доступна (primary), нет - другой стиль (secondary) и disabled */}
                <Button 
                  as={Link as any}
                  to={draftId ? `${ROUTES.CALCULATIONS}/${draftId}` : '#'}
                  variant={draftId ? "primary" : "secondary"}
                  disabled={!draftId}
                  className="me-3 fw-bold"
                >
                  {draftId ? `🛒 Текущая заявка (#${draftId})` : '🛒 Корзина пуста'}
                </Button>

                <Button variant="outline-danger" onClick={handleLogout}>
                  Выход
                </Button>
              </>
            ) : (
              <>
                <Button as={Link as any}to={ROUTES.LOGIN} variant="outline-primary" className="me-2">
                  Вход
                </Button>
                <Button as={Link as any}to={ROUTES.REGISTER} variant="primary">
                  Регистрация
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
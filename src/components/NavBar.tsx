import type { FC } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES } from '../Routes';

export const NavBar: FC = () => {
  return (
    <Navbar bg="light" expand="lg" className="mb-4 main-header" style={{borderRadius: '12px'}}>
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.HOME} className="app-title">⚡ Фотоэффект</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={ROUTES.HOME}>Главная</Nav.Link>
            <Nav.Link as={Link} to={ROUTES.RADIATIONS}>Каталог излучений</Nav.Link>
          </Nav>
          <Nav>
             <Nav.Link as={Link} to={ROUTES.CART} className="cart-icon" style={{fontSize: '1.5rem'}}>
                🛒<span className="cart-count">1</span>
             </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
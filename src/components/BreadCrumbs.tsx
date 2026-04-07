import React from "react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../Routes";

interface ICrumb {
  label: string;
  path?: string;
}

interface BreadCrumbsProps {
  crumbs: ICrumb[];
}

export const BreadCrumbs: FC<BreadCrumbsProps> = ({ crumbs }) => {
  // Если массив пуст, значит мы находимся в каталоге (корневая страница)
  const isRoot = crumbs.length === 0;

  return (
    <ul className="breadcrumbs">
      <li>
        {isRoot ? (
          <span className="current-page">Каталог излучений</span>
        ) : (
          <Link to={ROUTES.RADIATIONS} className="breadcrumb-link">Каталог излучений</Link>
        )}
      </li>
      
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <React.Fragment key={index}>
            <li className="slash">/</li>
            <li>
              {isLast ? (
                <span className="current-page">{crumb.label}</span>
              ) : (
                <Link to={crumb.path || ""} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        );
      })}
    </ul>
  );
};
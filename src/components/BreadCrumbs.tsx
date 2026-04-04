import React from "react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../Routes";

interface ICrumb {
  label: string;
  path?: string;
}

export const BreadCrumbs: FC<{ crumbs: ICrumb[] }> = ({ crumbs }) => {
  return (
    <ul className="breadcrumbs" style={{display: 'flex', listStyle: 'none', padding: 0, gap: '10px'}}>
      <li><Link to={ROUTES.HOME}>Главная</Link></li>
      {!!crumbs.length &&
        crumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <li className="slash">/</li>
            {index === crumbs.length - 1 ? (
              <li style={{color: 'black', fontWeight: 'bold'}}>{crumb.label}</li>
            ) : (
              <li><Link to={crumb.path || ""}>{crumb.label}</Link></li>
            )}
          </React.Fragment>
        ))}
    </ul>
  );
};
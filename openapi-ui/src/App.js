import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';

import DocSidebar from 'DocSidebar';
import DocItem from 'DocItem';
import DocPageTitle from 'DocPageTitle';

import styles from './App.module.css';

import './default-dark.css';
import { dereference } from 'x-dereference';

function slugify(string) {
  return string.toLowerCase().replace(/\s/g, '-');
}

function getPathsForTag(spec, tag) {
  return Object.entries(spec.paths)
    .map(([path, pathObj]) => {
      const entries = Object.entries(pathObj);
      return entries.map(([method, methodObj]) => {
        return {
          ...methodObj,
          method: method,
          path: path,
        };
      });
    })
    .flat()
    .filter((x) => x.tags.includes(tag));
}

function organizeSpec(spec) {
  // TODO: untagged go into default
  return spec.tags.map((tag) => {
    return {
      title: tag.name,
      description: tag.description,
      items: getPathsForTag(spec, tag.name),
    };
  });
}

function findActivePage(pages, hash) {
  const index = pages.findIndex((page) =>
    page.items.find((item) => `#${slugify(item.summary)}` === hash)
  );
  return Math.max(0, index);
}

function Page({ spec }) {
  const location = useLocation();

  const order = organizeSpec(dereference(spec));

  const docsSidebars = {
    default: order.map((x) => {
      return {
        items: x.items.map((y) => {
          return {
            href: `#${slugify(y.summary)}`,
            label: y.summary,
            type: 'link',
          };
        }),
        label: x.title,
        type: 'category',
      };
    }),
  };

  const sidebar = 'default';
  const sidebarCollapsible = true;

  const activePage = findActivePage(order, location.hash);

  return (
    <div className={styles.docPage}>
      {sidebar && (
        <div className={styles.docSidebarContainer}>
          <DocSidebar
            docsSidebars={docsSidebars}
            location={location}
            sidebar={sidebar}
            sidebarCollapsible={sidebarCollapsible}
          />
        </div>
      )}
      <main className={styles.docMainContainer}>
        <div className="padding-vert--lg">
          <div className="container">
            <DocPageTitle page={order[activePage]} />

            {order[activePage].items.map((item) => (
              <DocItem item={item} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function App({ spec }) {
  return (
    <Router>
      <Page spec={spec} />
    </Router>
  );
}

export default App;

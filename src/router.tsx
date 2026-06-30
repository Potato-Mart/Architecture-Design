import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { ArchitecturePage } from './pages/Architecture';
import { PhasesPage } from './pages/Phases';
import { PhaseDetailPage } from './pages/PhaseDetail';
import { TicketsPage } from './pages/Tickets';
import { TicketDetailPage } from './pages/TicketDetail';
import { AboutPage } from './pages/About';
import { NotFoundPage } from './pages/NotFound';

const LazyContractErdPage = lazy(() =>
  import('./pages/ContractErd').then((module) => ({ default: module.ContractErdPage })),
);

function ContractErdRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-slate-400 sm:px-6 lg:px-8">
          Loading contract ERD...
        </div>
      }
    >
      <LazyContractErdPage />
    </Suspense>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const architectureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/architecture',
  component: ArchitecturePage,
});

const contractsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contracts',
  component: ContractErdRoute,
});

const phasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/phases',
  component: PhasesPage,
});

const phaseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/phases/$slug',
  component: PhaseDetailPage,
});

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets',
  component: TicketsPage,
});

const ticketDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets/$id',
  component: TicketDetailPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  architectureRoute,
  contractsRoute,
  phasesRoute,
  phaseDetailRoute,
  ticketsRoute,
  ticketDetailRoute,
  aboutRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

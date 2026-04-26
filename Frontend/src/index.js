import React from 'react';
import { createRoot } from 'react-dom/client';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import thunk from 'redux-thunk';
import Root from './components/Root';
import AccountDragons from './components/AccountDragons';
import rootReducer from './reducers';
import PublicDragons from './components/PublicDragons';
import { fetchAuthenticated } from './actions/account';
import './index.css';
import { useSelector } from "react-redux";
import fetchStates from './reducers/fetchStates';

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

const container = document.getElementById('root');
const root = createRoot(container);

const RequireAuth = ({ children }) => {
  const { loggedIn, status } = useSelector(state => state.account);
  if (
    status === fetchStates.fetching ||
    status === undefined
  ) {
    return null;
  }

  return loggedIn
    ? children
    : <Navigate to="/" replace />;
};


store.dispatch(fetchAuthenticated())
  .then(() => {
    root.render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
           <Route path="/" element={<Root />} />
           <Route path="/account-dragons" element={<RequireAuth><AccountDragons /></RequireAuth> } />
           <Route path="/public-dragons" element={<RequireAuth><PublicDragons /></RequireAuth>}/>
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  });
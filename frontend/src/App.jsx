import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { store } from "./redux/store";
import { setupInterceptors } from "./services/api";
import { RealtimeProvider } from "./context/RealtimeContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import GlobalLoader from "./components/common/GlobalLoader";

setupInterceptors(store);

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <RealtimeProvider>
            <GlobalLoader />
            <AppRoutes />
          </RealtimeProvider>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;

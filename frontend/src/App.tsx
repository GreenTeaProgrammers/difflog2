import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import theme from "./theme";
import { Provider } from "react-redux";
import { store } from "../store";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import WelcomeScreen from "./components/diff/WelcomeScreen/WelcomeScreen";
import AnalyticsScreen from "./components/diff/AnalyticsScreen";
import AddLocationScreen from "./components/diff/AddLocationScreen";
import CameraUploadScreen from "./components/diff/CameraUploadScreen";
import ResultPage from "./components/diff/ResultPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const App: React.FC = () => {
  const handleAddLocation = (location: { name: string }) => {
    console.log("Added new location:", location.name);
    // In a real app, you might want to update a list of locations here
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/camera" element={<CameraUploadScreen />} />
              <Route path="/analytics" element={<AnalyticsScreen />} />
              <Route path="/location" element={<AddLocationScreen onAddLocation={handleAddLocation} />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/" element={<Navigate to="/welcome" />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;

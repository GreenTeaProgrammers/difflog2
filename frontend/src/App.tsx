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
import WelcomeScreen from "./components/diff/WelcomeScreen";
import AnalyticsScreen from "./components/diff/AnalyticsScreen";
import AddLocationScreen from "./components/diff/AddLocationScreen";
import CameraUploadScreen from "./components/diff/CameraUploadScreen";
import ResultPage from "./components/diff/ResultPage";

const App: React.FC = () => {
  const handleAddLocation = () => {
    // handle add location logic here
  };

  const handleBack = () => {
    // handle back logic here
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/welcome" element={<WelcomeScreen username={"test"} />}/>
            <Route path="/camera" element={<CameraUploadScreen/>}/>
            <Route path="/analytics" element={<AnalyticsScreen/>}/>
            <Route path="/location" element={<AddLocationScreen onAddLocation={handleAddLocation} />} />
            <Route path="/result" element={<ResultPage/>}/>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
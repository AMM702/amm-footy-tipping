import { interceptRegisterForm } from "./interceptRegisterForm";
import { setDefaultStates } from "./setDefaultStates";

// Run form intercept functions
interceptRegisterForm();

// Run other functions
setDefaultStates();